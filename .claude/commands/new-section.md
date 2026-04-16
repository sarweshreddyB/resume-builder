---
description: Add a new editor section end-to-end across all 5 files that need changing
---

Add a new resume section to ResumeForge. The user should provide: section ID (snake_case), display label, icon emoji, and accent color.

## Files that must ALL be updated — read each before editing

### 1. `src/utils/sectionOrder.js`
- Add the section key to `DEFAULT_SECTION_ORDER` array in the appropriate position

### 2. `src/App.jsx`
- Add entry to `EDITOR_SECTIONS` array: `{ id, label, icon, color }`
- Add a case to `sectionHasContent()` function
- Add a command palette entry under the Navigate group (auto-generated from EDITOR_SECTIONS loop — verify it's included)

### 3. `src/components/ResumeEditor.jsx`
- Add a new `if (activeSection === 'sectionId') return (...)` block
- Use `.nv-field`, `.nv-label`, `.nv-input`, `.nv-card`, `.nv-add-btn` CSS classes
- For list sections: include Add / Remove buttons and per-item fields
- For string sections: use a `<textarea className="nv-input">`

### 4. `src/utils/resumeParser.js`
- Add section keywords to `SECTION_KEYWORDS` map
- Add a `case 'sectionId':` block in the section switch statement

### 5. Every template in `src/templates/`
- Add the new section key to the appropriate zone key array (`MAIN_KEYS`, `LEFT_KEYS`, etc.)
- Add a renderer in the sections object (key → JSX) with `data-pdf-block` and `data-pdf-section-title` attributes
- Handle empty/missing data with a guard: `data.sectionId?.length > 0 &&`

## After all edits

Run `npm run build` to verify no compile errors. Report which zone each template placed the new section in.
