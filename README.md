# ResumeForge

A Novoresume-inspired resume builder with AI assistance, ATS scoring, PDF export, and 5 professional templates. Built entirely in the browser — no backend, no sign-up.

**Live demo:** https://sarweshreddyb.github.io/resume-builder/

---

## Features

| Feature | Details |
|---|---|
| **5 Templates** | Copenhagen, Geneva, Tokyo, Stockholm, New York |
| **AI Chat** | Ask the AI to improve bullet points, rewrite your summary, suggest keywords |
| **ATS Optimizer** | Completeness score + job description keyword matching |
| **PDF Export** | Smart page-break algorithm — never splits an entry mid-bullet |
| **Section Reordering** | Drag-free ↑/↓ reordering of resume sections |
| **Theme Customization** | 8 accent colors × 6 font families |
| **Photo Upload** | Optional profile photo (stored client-side as base64) |
| **Skill Proficiency** | 1–5 dot ratings per skill |
| **⌘K Command Palette** | Keyboard-first navigation across all actions |
| **JSON Resume Export** | Export to the open JSON Resume schema |
| **Import .txt** | Paste your existing resume as plain text — auto-parsed |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/sarweshreddyB/resume-builder.git
cd resume-builder
npm install
npm run dev
```

Open http://localhost:5173 (or the port shown in your terminal).

### Build for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the dist/ build locally
```

---

## Project Structure

```
src/
├── App.jsx                     # Root component — layout, state, routing
├── App.css                     # Full design system (CSS variables + all classes)
├── main.jsx                    # React entry point
│
├── components/
│   ├── Dashboard.jsx           # Landing screen (hero, template cards, features)
│   ├── ResumeEditor.jsx        # Section-based form editor (one section at a time)
│   ├── CommandPalette.jsx      # ⌘K command palette overlay
│   ├── AIChatPanel.jsx         # AI chat sidebar
│   ├── SectionOrderPanel.jsx   # ↑/↓ section reordering panel
│   └── TagInput.jsx            # Pill-style tag input (skills, tools, languages)
│
├── templates/
│   ├── index.js                # TEMPLATES registry array + named exports
│   ├── CopenhagenTemplate.jsx  # Two-column: experience/education left, skills right
│   ├── GenevaTemplate.jsx      # Sidebar + main content
│   ├── TokyoTemplate.jsx       # Dark sidebar + main content
│   ├── StockholmTemplate.jsx   # Full-width top + two-column bottom
│   └── NewYorkTemplate.jsx     # Executive minimal, crimson accents
│
└── utils/
    ├── resumeParser.js         # Plain-text resume → structured JSON
    ├── pdfGenerator.js         # html2canvas + jsPDF with smart page breaking
    └── sectionOrder.js         # DEFAULT_SECTION_ORDER + sortBySectionOrder()
```

---

## Resume .txt Format

The parser accepts plain text resumes. Use `[Section Name]` headers or ALL CAPS headers. Contact fields can be pipe-separated on one line.

```
Jane Smith
Senior Product Designer

jane@example.com | (415) 555-0100 | San Francisco, CA | linkedin.com/in/janesmith

[Summary]
Product designer with 6 years of experience crafting intuitive digital experiences.

[Experience]

Lead Product Designer | Acme Corp | San Francisco, CA | Jan 2021 - Present
- Redesigned onboarding flow, reducing drop-off by 35%
- Led a team of 4 designers across 3 product areas

[Education]

B.F.A. Graphic Design | Rhode Island School of Design | 2017

[Skills]
Figma, Sketch, Prototyping, User Research, Design Systems, Accessibility

[Projects]

Design System | github.com/jane/ds | Figma, React
- Built a component library used by 20+ engineers

[Certifications]
Google UX Design Certificate | Google | 2022

[Languages]
English (Native), French (Conversational)
```

**Supported section headers:** Summary, Experience, Education, Skills, Tools, Projects, Certifications, Languages, Awards (and common synonyms).

---

## Templates

Each template accepts three props:

| Prop | Type | Description |
|---|---|---|
| `data` | `object` | Parsed resume data (see schema below) |
| `theme` | `object` | `{ hex, light, mid, font }` |
| `sectionOrder` | `string[]` | Ordered array of section keys |

Templates use a **zone-based ordering** model. Each template defines which section keys belong to which column/zone (e.g. `LEFT_KEYS`, `RIGHT_KEYS`). The `sortBySectionOrder` utility orders keys within each zone — sections cannot jump between zones.

### Resume data schema

```js
{
  name, title, email, phone, location, linkedin, github, website,
  summary,           // string
  photo,             // base64 string | null
  experience: [{ title, company, location, dates, bullets: [] }],
  education:  [{ degree, school, year, details: [] }],
  skills:     [],    // string[]
  skillLevels: {},   // { [skill]: 1-5 }
  tools:      [],    // string[]
  projects:   [{ name, dates, tech, link, bullets: [] }],
  certifications: [{ name, issuer, year }],
  languages:  [],    // string[]
  awards:     [],    // string[]
}
```

### Adding a new template

1. Create `src/templates/MyTemplate.jsx` — accept `{ data, theme, sectionOrder }` props
2. Add `data-pdf-block` on each entry div and `data-pdf-section-title` on each section heading (enables smart PDF page breaks)
3. Export from `src/templates/index.js`:
   ```js
   export { default as MyTemplate } from './MyTemplate'
   export const TEMPLATES = [
     ...existing,
     { id: 'mytemplate', name: 'My City', accent: '#hexcolor' }
   ]
   ```
4. Register in `src/App.jsx` → `templateComponents` map

---

## PDF Generation

The PDF pipeline (`src/utils/pdfGenerator.js`) uses a DOM-position-aware page breaking algorithm:

1. Before rendering, queries all `[data-pdf-block]` elements and measures their pixel positions relative to the template root
2. For blocks immediately preceded by `[data-pdf-section-title]`, extends the block's top boundary to include the heading (prevents orphaned section titles)
3. Applies a smart-break algorithm: if a block straddles the nominal page boundary and ≥ 40% of the page is filled, break *before* the block; if < 40% is filled, break *after* it
4. Converts CSS-pixel break points to canvas-pixel offsets (html2canvas renders at 2× scale)
5. Slices the canvas at those positions and assembles a jsPDF document

Falls back to a brightness-row scan for templates without `data-pdf-block` annotations.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette |
| `⇧⌘P` | Download PDF |
| `J` | Toggle raw JSON viewer |
| `Esc` | Close any open overlay |

---

## Deployment

The project deploys automatically to GitHub Pages on every push to `main` via the workflow at `.github/workflows/deploy.yml`.

The Vite config sets `base: '/resume-builder/'` so all asset paths resolve correctly under the GitHub Pages subdirectory.

To deploy to a custom domain, set the `base` in `vite.config.js` to `'/'` and add a `CNAME` file to the `public/` directory.

---

## Tech Stack

- **React 18** + **Vite 4**
- **html2canvas** + **jsPDF** — PDF rendering
- No CSS framework — custom design system via CSS variables
- No routing library — `view` state (`'dashboard'` | `'editor'`)
- No state management library — React `useState` / `useCallback`
- No backend — fully client-side
