# Jahanvi Makwana — Portfolio

React + Vite + Three.js (react-three-fiber) + Framer Motion + Lenis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content
All text lives in `src/data/portfolio.js`.
- Add `github`, `linkedin` and project `repo` URLs — buttons stay hidden while they are empty.
- Put your resume PDF in `public/` and set `resume: '/your-file.pdf'` to show a Download button.

## What’s inside
- `src/scene/` — WebGL scene (smart-glasses model, particle field, wire knot). Lazy-loaded; scroll and mouse driven.
- `src/sound.js` — synthesized UI sounds (Web Audio, no files). Toggle in the nav; preference is remembered.
- `src/interactions.js` — global click ripple, hover tick and magnetic buttons. Add `data-sound="success|toggle|none"` to any button to override its sound.
- Respects `prefers-reduced-motion` and falls back gracefully if WebGL is unavailable.
