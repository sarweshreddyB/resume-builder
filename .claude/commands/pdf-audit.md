---
description: Audit all five templates for correct data-pdf-block and data-pdf-section-title attributes
---

Audit all five resume templates to verify they have the PDF page-break attributes required by `pdfGenerator.js`.

## What to check in each template

Read each of these files:
- `src/templates/CopenhagenTemplate.jsx`
- `src/templates/GenevaTemplate.jsx`
- `src/templates/TokyoTemplate.jsx`
- `src/templates/StockholmTemplate.jsx`
- `src/templates/NewYorkTemplate.jsx`

For each template, verify:

1. **`data-pdf-section-title="true"`** appears on every section heading element (the div/span that renders the section title text like "Experience", "Education", etc.)
2. **`data-pdf-block="true"`** appears on every entry container:
   - Each experience entry (the grid/div wrapping one job)
   - Each education entry
   - Each project entry
   - Each certification entry
   - Award items if they exist as separate elements
3. Skills chips row — skills usually render as a flat chips row, which doesn't need `data-pdf-block` since it's not a multi-line block. Confirm this is the case.
4. Summary — summary is typically a single block, not an array. Check whether it benefits from `data-pdf-block`.

## Report format

For each template, output a table:

| Section | data-pdf-section-title | data-pdf-block on entries |
|---|---|---|
| Experience | ✓ / ✗ | ✓ / ✗ |
| Education | ✓ / ✗ | ✓ / ✗ |
| Projects | ✓ / ✗ | ✓ / ✗ |
| Certifications | ✓ / ✗ | ✓ / ✗ |

Then list any missing attributes with the exact JSX line that needs to be fixed.
Fix all issues found, then run `npm run build` to verify.
