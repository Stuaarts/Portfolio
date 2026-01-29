# Portfolio (Static)

Security-focused multi-page static portfolio for Lucas Tavares Criscuolo.

## Structure
- `index.html` + subpages (`about/`, `projects/`, `experience/`, `security/`, `contact/`, `styleguide/`)
- `assets/` CSS/JS/images, `content/` JSON data
- Root: `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `vercel.json`

## Run locally
- Fastest: use VS Code Live Server or any static server: `npx serve .` (or Python `python -m http.server`).
- If opening via `file:///`, some browsers restrict `fetch` for JSON; prefer a local server for filters/projects data.

## Deploy to Vercel
1. Push this folder to a repo.
2. In Vercel, “New Project” ? import repo.
3. Framework preset: **Other**; Output dir: `/` (root). No build step needed.
4. Vercel will serve static files and apply headers from `vercel.json`.

## Editing data
- Projects: `content/projects.json` (add/edit items; `featured: true` controls home section).
- Experience & certs: `content/experience.json`.
- Images: drop replacements into `assets/img/placeholders/` and update JSON paths.

## Contact (EmailJS optional)
- Form works with mailto fallback.
- To enable EmailJS: add `data-emailjs-service`, `data-emailjs-template`, and `data-emailjs-key` attributes on the form in `contact/index.html`, then include EmailJS SDK.

## SEO/OG
- Update canonical URLs and OG images per page.
- Replace `assets/img/placeholders/project-1.webp` with a real OG image for richer shares.

## Colors & fonts
- Tokens live in `assets/css/base.css` under `:root` and `[data-theme="dark"]`.
- Adjust primary/accent/background there; typography uses Google Font **Sora**.

## Animations
- GSAP + ScrollTrigger via CDN, centralized in `assets/js/animations.js`.
- Respects `prefers-reduced-motion`.

## Security headers
- `vercel.json` sets CSP, frame, referrer, permissions, and content-type options. Update CSP sources if you add new CDNs.

## Placeholder resume
- Resume link: `assets/docs/resume.pdf` (add your file).

