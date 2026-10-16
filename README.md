# SCTS Student Tracker — Class 10 (2026–27)

Sri Chaitanya Techno School student dashboard: syllabus tracker, test planner, marks, revision, study planner, calendar and chapter-wise Science and Maths question banks.

## Files
- `index.html`, `styles.css`, `script.js`, `papers.js`, `logo.png`, `tracker-logo.svg` — the site (keep in the repo root)
- `papers/science/` — Science Volume 1 and 2 chapter PDFs (35 files)
- `papers/maths/` — Maths Volume 2, 3 and 4 chapter PDFs plus one answer-explanation annexure per volume (32 files)
- `legacy/` — old unused files kept for reference (not loaded by the site)
- Sign-in is handled by Clerk (publishable key is in `index.html`). Add your GitHub Pages address in the Clerk dashboard if sign-in redirects fail.

## Upload (GitHub Pages: `main` / root)
Upload the site files first, then the `papers` folder in two commits (`science`, then `maths`).

## Notes
- All PDFs are compressed (about 40 MB in total, down from about 150 MB of source volumes).
- Maths Volume 1 is not included in the files provided, so it is not listed on the site.
- If you change `papers.js`, `script.js` or `styles.css`, bump the `?v=` number in `index.html` so browsers fetch the new copy.
