/**
 * PDF Generator — DOM-position-aware page breaking
 *
 * How open-source tools handle this:
 *
 *  • Paged.js     — walks the DOM after layout, measures getBoundingClientRect() on every
 *                   element, respects CSS `break-inside: avoid` by computing break positions
 *                   that land between block boundaries, never inside them.
 *
 *  • html2pdf.js  — for each nominal page boundary it walks up the DOM looking for an
 *                   element whose `offsetTop` places it entirely past the boundary, then
 *                   adds white-space "padding" in the PDF so that element starts fresh on
 *                   the next page.
 *
 *  • WeasyPrint   — full typesetting engine: measures all boxes before ink hits paper.
 *
 * Our implementation (for a browser-only canvas pipeline):
 *
 *  1. Before calling html2canvas, query all [data-pdf-block] elements and measure their
 *     getBoundingClientRect() positions relative to the template root.  This gives us
 *     exact CSS-pixel top/bottom for every "unbreakable unit" (experience entry,
 *     education entry, project, etc.).
 *
 *  2. For elements immediately preceded by a [data-pdf-section-title], extend that
 *     block's top upward to include the title, preventing orphaned section headers.
 *
 *  3. Run the smart-break algorithm:
 *       – For each nominal page boundary (cursor + 1122 CSS px), find blocks that
 *         straddle it.
 *       – If a block straddles and at least 40 % of the page is already filled,
 *         break BEFORE the block (push it to the next page).
 *       – If less than 40 % is filled (block starts very early), keep it on this
 *         page and break AFTER the block.
 *       – If the block is taller than a full page, accept a nominal split.
 *
 *  4. Convert CSS-pixel break points to canvas-pixel offsets (canvas.width / 794)
 *     and slice the canvas at those exact positions.
 *
 *  Fallback: if no [data-pdf-block] elements are found (e.g. custom template),
 *  the generator falls back to the brightness-row heuristic so output is never
 *  worse than before.
 */

import html2canvas from 'html2canvas'
import jsPDF       from 'jspdf'

// ── DOM measurement ───────────────────────────────────────────────────────────

/**
 * Returns an array of {top, bottom} in CSS pixels, relative to the template
 * element's own top edge, for every [data-pdf-block] descendant.
 *
 * For a block that is the first child after a [data-pdf-section-title], its
 * `top` is extended upward to include the title — keeping headers with their
 * first content item (the "orphan control" that Paged.js calls keep-with-next).
 */
function measureBlocks(templateEl) {
  const tRect   = templateEl.getBoundingClientRect()
  const marked  = Array.from(templateEl.querySelectorAll('[data-pdf-block], [data-pdf-section-title]'))
  const blocks  = []

  for (let i = 0; i < marked.length; i++) {
    const el = marked[i]
    if (!el.hasAttribute('data-pdf-block')) continue

    const r   = el.getBoundingClientRect()
    let   top = r.top - tRect.top

    // Extend top upward to swallow the section title above this block (if any)
    const prev = marked[i - 1]
    if (prev && prev.hasAttribute('data-pdf-section-title')) {
      const pr = prev.getBoundingClientRect()
      top = pr.top - tRect.top
    }

    blocks.push({
      top:    Math.round(top),
      bottom: Math.round(r.bottom - tRect.top),
    })
  }

  return blocks.sort((a, b) => a.top - b.top)
}

// ── Smart break algorithm ─────────────────────────────────────────────────────

/**
 * Compute an array of CSS-pixel y-offsets at which to slice the canvas.
 * The first element is always 0; the last is totalHeightCss.
 *
 * Rules (mirrors Paged.js / html2pdf.js logic):
 *   • Never split a block that is shorter than one full page.
 *   • If a block straddles the nominal boundary AND fills ≥ 40 % of the page,
 *     break before it  (push it to the next page — most common case).
 *   • If fill < 40 %, break after it  (keep it on this page, start next page
 *     fresh after the block) — prevents near-empty pages.
 *   • For blocks taller than one page  → unavoidable split at nominal boundary.
 */
function computeBreaks(totalHeightCss, pageHeightCss, blocks) {
  const PAGE    = pageHeightCss
  const MIN_FILL = PAGE * 0.40   // 40 % of page must be used to justify a "break before"

  const breaks = [0]
  let   cursor = 0
  const MAX_PAGES = 30            // safety against infinite loops

  while (cursor + PAGE < totalHeightCss - 8 && breaks.length < MAX_PAGES) {
    const nominal = cursor + PAGE

    // Blocks that straddle the nominal cut line
    const straddling = blocks.filter(b => b.top < nominal && b.bottom > nominal)

    if (straddling.length === 0) {
      breaks.push(nominal)
      cursor = nominal
      continue
    }

    // The latest-starting block is the one whose top is closest to (just under) the cut
    const pivot      = straddling.reduce((a, b) => b.top > a.top ? b : a)
    const blockH     = pivot.bottom - pivot.top
    const filled     = pivot.top - cursor     // content above the pivot on this page

    if (blockH >= PAGE) {
      // Block is taller than a page — can't avoid splitting, use nominal cut
      breaks.push(nominal)
      cursor = nominal
    } else if (filled >= MIN_FILL) {
      // Enough content already on this page → break BEFORE the pivot
      const cut = pivot.top - 4               // 4 px gap so block doesn't clip at edge
      breaks.push(Math.max(cut, cursor + 60)) // never create a page shorter than 60 px
      cursor = breaks[breaks.length - 1]
    } else {
      // Too little content on this page → keep pivot on this page, break AFTER it
      const cut = pivot.bottom + 4
      if (cut <= cursor + PAGE * 1.5) {
        // Acceptable overshoot (up to 1.5 × page height)
        breaks.push(cut)
        cursor = cut
      } else {
        // Overshoot too large — fall back to nominal
        breaks.push(nominal)
        cursor = nominal
      }
    }
  }

  breaks.push(Math.ceil(totalHeightCss))
  return breaks
}

// ── Brightness-row fallback (for templates without data-pdf-block) ─────────────

function brightestRowInStrip(canvas, startY, endY) {
  startY = Math.max(0, startY)
  endY   = Math.min(canvas.height - 1, endY)
  if (endY <= startY) return endY

  const ctx = canvas.getContext('2d')
  const w   = canvas.width
  const h   = endY - startY + 1
  const { data } = ctx.getImageData(0, startY, w, h)

  let bestScore = -1
  let bestY     = endY

  for (let row = 0; row < h; row++) {
    let sum = 0
    const base = row * w * 4
    for (let col = 0; col < w; col++) {
      const i = base + col * 4
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3
    }
    if (sum / w > bestScore) {
      bestScore = sum / w
      bestY     = startY + row
    }
  }
  return bestY
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function downloadAsPDF(elementId, filename = 'resume.pdf') {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Resume element not found')

  const originalTransform = element.style.transform
  const originalWidth     = element.style.width
  element.style.transform = 'none'
  element.style.width     = '794px'

  // ── Step 1: measure blocks from the live DOM (before cloning) ──────────────
  const blocks        = measureBlocks(element)
  const totalHeightCss = element.scrollHeight
  const PAGE_CSS       = 1122

  // ── Step 2: choose strategy ────────────────────────────────────────────────
  const useDomBreaks  = blocks.length > 0
  const cssBreaks     = useDomBreaks
    ? computeBreaks(totalHeightCss, PAGE_CSS, blocks)
    : null       // will fall back to brightness after canvas is ready

  try {
    // ── Step 3: render to canvas ──────────────────────────────────────────────
    const canvas = await html2canvas(element, {
      scale:           2,
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      logging:         false,
      windowWidth:     794,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId)
        if (!clonedEl) return
        clonedEl.style.transform = 'none'
        clonedEl.style.width     = '794px'
        clonedEl.style.boxShadow = 'none'
        // Lift overflow / clipping from every ancestor so html2canvas
        // captures the full multi-page height (same trick Paged.js uses in
        // its print polyfill to break out of constrained containers)
        let p = clonedEl.parentElement
        while (p && p.tagName !== 'BODY') {
          p.style.overflow  = 'visible'
          p.style.height    = 'auto'
          p.style.maxHeight = 'none'
          p.style.clipPath  = 'none'
          p.style.zoom      = '1'
          p.style.transform = 'none'
          p = p.parentElement
        }
      },
    })

    // ── Step 4: convert break points to canvas coordinates ──────────────────
    const scale         = canvas.width / 794       // 2.0 at scale:2
    const nominalPagePx = Math.round(PAGE_CSS * scale)

    let canvasBreaks
    if (useDomBreaks) {
      // DOM-based: scale CSS px → canvas px
      canvasBreaks = cssBreaks.map(y => Math.round(y * scale))
    } else {
      // Fallback: brightness scanning (180 CSS px search window)
      const searchBack = Math.round(180 * scale)
      const totalPages = Math.max(1, Math.ceil(canvas.height / nominalPagePx))
      canvasBreaks = [0]
      for (let pg = 1; pg < totalPages; pg++) {
        const nominal = pg * nominalPagePx
        canvasBreaks.push(brightestRowInStrip(canvas, nominal - searchBack, nominal))
      }
      canvasBreaks.push(canvas.height)
    }

    // ── Step 5: slice canvas → PDF pages ──────────────────────────────────────
    const A4_W      = 210
    const A4_H      = 297
    const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const totalPgs  = canvasBreaks.length - 1

    for (let pg = 0; pg < totalPgs; pg++) {
      if (pg > 0) pdf.addPage()

      const srcY      = canvasBreaks[pg]
      const srcHeight = canvasBreaks[pg + 1] - srcY

      // Always output a full A4-height canvas slice (white-pad the bottom
      // of the last page so the PDF page proportions stay correct)
      const pageCanvas      = document.createElement('canvas')
      pageCanvas.width      = canvas.width
      pageCanvas.height     = nominalPagePx
      const ctx = pageCanvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0, srcY, canvas.width, srcHeight,   // source slice
        0, 0,    canvas.width, srcHeight,   // dest (top-aligned, white below)
      )

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.97)
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H)
    }

    pdf.save(filename)
  } finally {
    element.style.transform = originalTransform
    element.style.width     = originalWidth
  }
}
