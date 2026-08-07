# CBSE Pro Class 10 — GitHub Pages + Clerk

This is the **ready-to-upload static version** of the CBSE Class 10 student dashboard. It uses ClerkJS through the official CDN/script-tag method, so **you do not need Vite, npm, or a build step** to publish this version on GitHub Pages. Clerk documents both the npm/Vite method and the script-tag method.

## Upload to GitHub Pages

Upload these files to the root of your repository:

- `index.html`
- `script.js`
- `style.css`
- `question-bank.js`
- `question-bank.json`

Keep GitHub Pages configured as `main` + `/ (root)`.

## Clerk

The dashboard uses the Clerk Development Publishable Key (`pk_test_...`) supplied for this application. Publishable keys are intended for frontend use; **never add the Clerk Secret Key to this repository**.

Clerk Frontend API: `https://living-doberman-5.clerk.accounts.dev`

If Clerk asks for an allowed web origin/domain, add:

`https://prakharmishrs75.github.io`

## Student flow

1. Clerk Sign In / Sign Up
2. Student name + class profile
3. Dashboard
4. Profile button for editing/sign out

## Included dashboard features

- Syllabus tracker
- Marks tracker
- Revision center
- Study calendar
- Official CBSE competency PDF links for Maths and Science
- Optional GitHub question-bank JSON sync
