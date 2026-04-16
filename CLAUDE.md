# ResumeForge — Claude Code Instructions

## Project overview

Browser-only React resume builder. No backend, no auth, no routing library.
Two screens: `Dashboard` (landing) and `Editor` (3-column workspace).
State lives entirely in `App.jsx`; no global store.

Live: https://sarweshreddyb.github.io/resume-builder/
Repo: https://github.com/sarweshreddyB/resume-builder

---

## Commands

```bash
npm run dev      # start dev server (usually :5173 or :5174 if port in use)
npm run build    # production build → dist/ (must pass before committing)
npm run preview  # serve dist/ locally
```

Always run `npm run build` after changes before committing.

---

## Rules

These rules are absolute. Do not break them without explicit user instruction.

### Architecture
1. **No backend** — no fetch/API calls, no database, no auth, no server-side code. Everything runs in the browser.
2. **No React Router** — routing is a `view` state variable: `'dashboard'` | `'editor'`. Do not add a router.
3. **No CSS frameworks** — no Tailwind, Bootstrap, or any external CSS library. Use the existing CSS variables and class system in `App.css`.
4. **No new state managers** — no Redux, Zustand, Jotai, etc. Use React `useState`/`useCallback` in `App.jsx` only.
5. **photo is separate** — `photo` (base64 string) lives in its own `useState`, not inside `resumeData`. It is merged only at template render time: `data={{ ...resumeData, photo }}`. Never put it in `resumeData`.

### Editor
6. **One section at a time** — `ResumeEditor` renders only the form for `activeSection`. Never render all 9 sections simultaneously. Pattern: `if (activeSection === 'x') return (...)`
7. **EMPTY_RESUME must stay complete** — every field that appears in `resumeData` must have an empty initializer in the `EMPTY_RESUME` constant in `App.jsx`.

### Templates
8. **Root element requirements** — every template root `<div>` must have: `id="resume-template"`, `width: '794px'`, `minHeight: '1122px'`. The PDF pipeline depends on these.
9. **PDF attributes are mandatory** — `data-pdf-block="true"` on every entry container (each job, education entry, project, cert). `data-pdf-section-title="true"` on every section heading. Missing attributes cause bad page breaks.
10. **Inline styles only in templates** — templates use a `const s = { ... }` object. No CSS class usage inside template files.
11. **Zone-based ordering** — templates define zone key arrays and call `sortBySectionOrder(sectionOrder, ZONE_KEYS)`. Sections cannot jump between zones.
12. **Guard all array data** — every section renderer must guard: `data.field?.length > 0 && (...)`.

### CSS / styling
13. **CSS class naming conventions** — follow existing prefixes: `nv-*` for workspace/layout, `nv-dash-*` for dashboard, `so-*` for section order panel, `cp-*` for command palette, `ai-*` for AI chat, `raw-json-*` for JSON viewer.
14. **Design tokens in :root** — new colors or spacing values go in CSS variables in `:root` at the top of `App.css`, not as magic values sprinkled through the file.

### Git / deployment
15. **Never commit node_modules or dist** — `.gitignore` excludes them. Never use `git add -A` or `git add .` without verifying the gitignore is effective.
16. **Build must pass before commit** — run `npm run build` and confirm zero errors before staging any commit.
17. **base path is `/resume-builder/`** — `vite.config.js` sets this for GitHub Pages. Do not change it unless moving to a custom domain.

---

## Skills (slash commands)

Invoke with `/skill-name` in the Claude Code prompt.

| Command | Description |
|---|---|
| `/new-template` | Scaffold a complete new resume template — zones, PDF attributes, registry wiring |
| `/new-section` | Add a new editor section across all 5 files that must change |
| `/deploy` | Build, commit staged changes, and push to trigger GitHub Pages deployment |
| `/pdf-audit` | Audit all 5 templates for correct `data-pdf-block` / `data-pdf-section-title` attributes |
| `/ats-review` | Review and improve ATS scoring logic, stop-words, keyword extraction |

Skill files live in `.claude/commands/`.

---

## Agents

These sub-agents have deep domain knowledge for specific tasks. Use them instead of ad-hoc implementation for their domains.

| Agent | When to use |
|---|---|
| `template-builder` | Creating or significantly rewriting a resume template |
| `section-builder` | Adding a new section to the editor (knows all 5 files) |
| `pdf-debugger` | Diagnosing bad page breaks, clipped content, blank pages in PDF export |
| `code-reviewer` | Reviewing changes before commit — checks all architecture rules |

Agent files live in `.claude/agents/`. Invoke via the Agent tool with `subagent_type` matching the agent name, or reference them by name when asking Claude to use a specific agent.

---

## Memory

Claude Code auto-memory for this project is stored at:
`~/.claude/projects/-Users-sarweshreddy/memory/`

### What to remember across sessions
- User decisions that change the architecture (e.g. "we decided to add a sixth template")
- Template names and accent colors that have been added
- Bugs that were found and their root causes (so they don't recur)
- Any performance issues discovered with specific data sizes or edge cases
- User feedback on code style preferences specific to this project

### What NOT to remember
- Current file contents — read the file instead
- In-progress work — use tasks for that
- Things already documented in this CLAUDE.md

---

## Architecture reference

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

### Template rendering
```js
<TemplateComponent
  data={{ ...resumeData, photo }}   // photo merged here only
  theme={activeTheme}               // { hex, light, mid, xlight, timeline, font }
  sectionOrder={sectionOrder}       // string[] from DEFAULT_SECTION_ORDER
/>
```

### ATS panel
`showATSPanel` toggles `.nv-ats-panel.open` (slides in from right, fixed position).
`computeCompleteness(data)` → `{ score: 0–100, results: [{key, label, pass}] }`
`extractKeywords(jd)` → top-28 keywords by frequency, stop-words filtered
`kwFound(kw, data)` → `JSON.stringify(data).toLowerCase().includes(kw)`

---

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
| `.claude/commands/` | Slash command skill files |
| `.claude/agents/` | Sub-agent definition files |

---

## Resume data schema

```js
{
  name, title, email, phone, location, linkedin, github, website,
  summary,            // string
  // photo is NOT here — separate useState in App.jsx
  experience: [{ title, company, location, dates, bullets: [] }],
  education:  [{ degree, school, year, details: [] }],
  skills:     [],     // string[]
  skillLevels: {},    // { [skill]: 1–5 }
  tools:      [],     // string[]
  projects:   [{ name, dates, tech, link, bullets: [] }],
  certifications: [{ name, issuer, year }],
  languages:  [],     // string[]
  awards:     [],     // string[]
}
```

---

## How to add a template

1. Use the `template-builder` agent or `/new-template` skill
2. Or manually:
   - Create `src/templates/CityTemplate.jsx` (zone arrays, inline styles, PDF attributes, `id="resume-template"`)
   - Export from `src/templates/index.js`, add to `TEMPLATES` array
   - Add to `templateComponents` map in `src/App.jsx`
   - Run `npm run build`

## How to add an editor section

1. Use the `section-builder` agent or `/new-section` skill
2. Or manually update all 5 files: `sectionOrder.js`, `App.jsx` (3 places), `ResumeEditor.jsx`, `resumeParser.js`, all 5 templates

## Deployment

Auto-deploys on push to `main` via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages).
To manually trigger: push any commit, or use `gh workflow run deploy.yml`.
