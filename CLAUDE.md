# ResumeForge — Claude Code Instructions

## Project overview

Browser-only React resume builder. No backend, no auth, no routing library.
Two screens: `Dashboard` (landing) and `Editor` (3-column workspace).
State lives entirely in `App.jsx`; no global store.

## Commands

```bash
npm run dev      # start dev server (usually :5173 or :5174 if port in use)
npm run build    # production build → dist/ (must pass before committing)
npm run preview  # serve dist/ locally
```

**Always run `npm run build` after changes to verify no compile errors before committing.**

## Architecture

### Layout (editor view)
```
nv-topbar (54px)
nv-workspace (flex row, fills remaining height)
  nv-snav (220px)          ← section nav + design panel
  nv-editor (420px)        ← active section form only
  nv-preview (flex: 1)     ← live template preview + AI chat
```

### View routing
`view` state (`'dashboard'` | `'editor'`) — no React Router.
`if (view === 'dashboard') return <Dashboard .../>` at the top of App render.

### Section-focused editing
`activeSection` state drives which section form renders in `ResumeEditor`.
`ResumeEditor` renders a single `if (activeSection === 'x') return (...)` block per section.
Never render all sections at once — it would be too slow and cluttered.

### Template rendering
```js
<TemplateComponent
  data={{ ...resumeData, photo }}   // photo passed separately, merged here
  theme={activeTheme}               // { hex, light, mid, xlight, timeline, font }
  sectionOrder={sectionOrder}       // string[] from DEFAULT_SECTION_ORDER
/>
```

### Section ordering — zone model
Each template defines key arrays per column/zone (e.g. `MAIN_KEYS`, `LEFT_KEYS`, `RIGHT_KEYS`).
`sortBySectionOrder(sectionOrder, ZONE_KEYS)` orders keys within that zone.
Sections **cannot jump between zones** — reordering only changes order within the same column.
`SectionOrderPanel` (`so-*` CSS classes) renders inside the sidebar.

### PDF generation
`downloadAsPDF('resume-template', filename)` — reads `[data-pdf-block]` and
`[data-pdf-section-title]` attributes from the live DOM to compute page breaks.
Every template entry div must have `data-pdf-block="true"`.
Every section heading must have `data-pdf-section-title="true"`.
Without these, the generator falls back to a brightness-row heuristic (lower quality).

## Key files

| File | Role |
|---|---|
| `src/App.jsx` | All state, layout, routing, command palette, ATS logic |
| `src/App.css` | Entire design system — CSS variables + every class |
| `src/components/ResumeEditor.jsx` | Section forms (personal, summary, experience, …) |
| `src/components/Dashboard.jsx` | Landing screen |
| `src/templates/*.jsx` | Five resume templates |
| `src/utils/resumeParser.js` | Plain-text → structured JSON |
| `src/utils/pdfGenerator.js` | html2canvas + jsPDF pipeline |
| `src/utils/sectionOrder.js` | `DEFAULT_SECTION_ORDER` + `sortBySectionOrder()` |

## CSS conventions

- All design tokens are CSS variables in `:root` at the top of `App.css`
- Sidebar classes: `nv-snav-*`
- Editor classes: `nv-editor-*`, `nv-field`, `nv-label`, `nv-input`, `nv-card`
- Preview classes: `nv-preview-*`, `nv-page-card`, `nv-page-clip`
- Dashboard classes: `nv-dash-*`
- Section order panel: `so-*`
- Command palette: `cp-*`
- AI chat: `ai-*`
- Raw JSON viewer: `raw-json-*`
- Utility buttons: `btn-primary`, `btn-outline`, `btn-ghost`, `btn-icon`, `btn-sm`

Do not use Tailwind or any external CSS framework. Inline styles are acceptable inside template files (templates use `const s = { ... }` style objects). App-level UI uses CSS classes only.

## Resume data schema

```js
{
  name, title, email, phone, location, linkedin, github, website,
  summary,            // string
  photo,              // base64 string | null  (NOT stored in resumeData — separate state)
  experience: [{ title, company, location, dates, bullets: [] }],
  education:  [{ degree, school, year, details: [] }],
  skills:     [],     // string[]
  skillLevels: {},    // { [skill]: 1–5 }  — separate from skills array
  tools:      [],     // string[]
  projects:   [{ name, dates, tech, link, bullets: [] }],
  certifications: [{ name, issuer, year }],
  languages:  [],     // string[]
  awards:     [],     // string[]
}
```

`photo` is stored in a separate `photo` state variable in App.jsx, not inside `resumeData`.
It is merged at render time: `data={{ ...resumeData, photo }}`.

## Adding a template

1. Create `src/templates/CityTemplate.jsx`
   - Props: `({ data, theme = {}, sectionOrder = [] })`
   - Define zone key arrays and use `sortBySectionOrder(sectionOrder, ZONE_KEYS)`
   - Add `data-pdf-block="true"` on each entry container
   - Add `data-pdf-section-title="true"` on each section heading
   - Root element must have `id="resume-template"`, width `794px`, minHeight `1122px`
2. Export from `src/templates/index.js` and add to `TEMPLATES` array with `{ id, name, accent }`
3. Register in `templateComponents` map in `App.jsx`

## Adding an editor section

1. Add to `EDITOR_SECTIONS` array in `App.jsx` (id, label, icon, color)
2. Add `sectionHasContent()` case in App.jsx
3. Add a new `if (activeSection === 'x') return (...)` block in `ResumeEditor.jsx`
4. Add the section key to `DEFAULT_SECTION_ORDER` in `src/utils/sectionOrder.js` if it should be reorderable
5. Add parsing support in `src/utils/resumeParser.js` if it should be importable from .txt

## ATS panel

`showATSPanel` state toggles `.nv-ats-panel.open` CSS class (slides in from right, fixed position).
`computeCompleteness(data)` → `{ score: 0–100, results: [{key, label, pass}] }`
`extractKeywords(jobDescription)` → top-28 keywords from JD (frequency analysis, stop-words filtered)
`kwFound(keyword, data)` → `JSON.stringify(data).toLowerCase().includes(keyword)`

## Deployment

- GitHub repo: https://github.com/sarweshreddyB/resume-builder
- Live URL: https://sarweshreddyb.github.io/resume-builder/
- Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- `vite.config.js` sets `base: '/resume-builder/'` — required for GitHub Pages subdirectory

## What to avoid

- Do not add a backend, database, or auth layer — this is intentionally client-only
- Do not install a CSS framework (Tailwind, Bootstrap, etc.)
- Do not add React Router — the `view` state pattern is intentional and sufficient
- Do not render all editor sections simultaneously — only the active one
- Do not store `photo` inside `resumeData` — it is separate state merged at render time
- Do not skip `data-pdf-block` / `data-pdf-section-title` attributes on new template entries
- Do not use `git add -A` or `git add .` without verifying `.gitignore` is in place — `node_modules` and `dist` must be excluded
