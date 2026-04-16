---
description: Review and improve the ATS scoring logic — completeness checks, keyword extraction, and stop-words list
---

Review the ATS scoring system in ResumeForge and suggest or apply improvements.

## What to read first

- `src/App.jsx` — `COMPLETENESS_CHECKS`, `computeCompleteness()`, `STOP_WORDS`, `extractKeywords()`, `kwFound()`
- The ATS panel JSX in App.jsx (search for `nv-ats-panel`)

## Areas to review

### 1. Completeness checks (`COMPLETENESS_CHECKS` array)
- Are all important resume sections represented?
- Are the thresholds reasonable? (e.g. summary 40+ chars, skills 3+)
- Are there missing checks that ATS systems commonly look for?

### 2. Stop-words list (`STOP_WORDS` Set)
- Are common English words properly filtered?
- Are there domain-specific words that should be added (e.g. "seeking", "responsible")?
- Are any legitimate technical keywords accidentally in the stop list?

### 3. Keyword extraction (`extractKeywords`)
- Currently extracts top 28 keywords by frequency — is that the right number?
- Currently filters words shorter than 3 chars — should compound terms (e.g. "node.js") be handled specially?
- Are multi-word phrases (bigrams like "machine learning") extracted?

### 4. Keyword matching (`kwFound`)
- Currently does a simple `JSON.stringify(data).includes(keyword)` — are there false positives?
- Should matching be word-boundary aware?

### 5. Score display
- The score is shown as `completeness.score%` in the topbar button
- Is the visual breakdown in the panel clear enough?

## Output

Report findings as a prioritized list: High / Medium / Low impact.
For High impact items, apply the fix directly. For others, describe the change needed.
Run `npm run build` after any edits.
