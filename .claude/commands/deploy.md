---
description: Build, verify, commit staged changes, and push to trigger GitHub Pages deployment
---

Deploy the current changes to GitHub Pages.

## Steps

1. Run `npm run build` — if it fails, stop and report the errors. Do not proceed.
2. Run `git diff --stat` and `git status` to show what's changing.
3. Ask the user for a commit message if one wasn't provided.
4. Stage only source files (never `node_modules/` or `dist/`):
   - `git add src/ public/ .github/ CLAUDE.md README.md vite.config.js package.json` (adjust to what actually changed)
5. Commit with the provided message.
6. `git push`
7. Report the live URL: https://sarweshreddyb.github.io/resume-builder/
   GitHub Actions will rebuild and deploy — typically takes ~60 seconds.

## Do not

- Do not `git add .` or `git add -A` — node_modules must stay out
- Do not force push
- Do not push if the build failed
