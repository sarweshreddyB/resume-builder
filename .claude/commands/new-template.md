---
description: Scaffold a complete new resume template with correct zones, PDF attributes, and registry wiring
---

Scaffold a new resume template for ResumeForge. The user may have provided a city name and/or color — ask if not provided.

## Steps to complete

1. **Read** `src/templates/CopenhagenTemplate.jsx` and `src/templates/NewYorkTemplate.jsx` as reference implementations.
2. **Read** `src/templates/index.js` to see the current registry.
3. **Read** `src/App.jsx` lines 138–145 to see the `templateComponents` map.

## Template requirements (non-negotiable)

- File: `src/templates/{CityName}Template.jsx`
- Props: `({ data, theme = {}, sectionOrder = [] })`
- Root `<div>` must have `id="resume-template"`, `width: '794px'`, `minHeight: '1122px'`
- Import and use `sortBySectionOrder` from `../utils/sectionOrder`
- Define zone key arrays (`MAIN_KEYS`, `LEFT_KEYS`, etc.) and call `sortBySectionOrder(sectionOrder, ZONE_KEYS)` for each
- Every entry container (experience item, education item, project, cert) must have `data-pdf-block="true"`
- Every section heading must have `data-pdf-section-title="true"`
- Theme shape: `theme.hex` (accent color), `theme.light` (light bg), `theme.font` (font family string) — all with sensible defaults
- Use inline style objects (const `s = { ... }` pattern) — no CSS classes inside templates
- Handle missing data gracefully: `data.experience?.length > 0 &&` guards on every section

## Registry wiring (do all three)

1. Add named export to `src/templates/index.js` and add entry to `TEMPLATES` array: `{ id: 'cityname', name: 'City Name', accent: '#hexcolor' }`
2. Import and add to `templateComponents` map in `src/App.jsx`

## After writing all files

Run `npm run build` to verify no compile errors before reporting done.
