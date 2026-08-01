# Farhan Bashir — 3D Portfolio + Personal AI Agent

FlyRank AI internship capstone (Track: **General AI Fluency** · Code: `FL-CAP` · Week 6).

A dark, premium 3D portfolio built with **Three.js** and vanilla JS/CSS, with an embedded
**personal agent** that answers questions about me from a local knowledge base — no API key,
no backend, works entirely on static hosting.

**Live site:** https://FarhanRajputFelix.github.io/portfolio/

---

## What's inside

| Feature | Detail |
|---|---|
| 3D hero | ~3,200-particle field + 6 floating geometric meshes, reacting to mouse/touch and scroll |
| Scroll experience | IntersectionObserver reveals, scroll-spy nav, camera dolly tied to scroll progress |
| Personal agent | Keyword + phrase retrieval over a 19-entry knowledge base, refuses to answer what it doesn't know |
| Responsive | Full-screen chat and hamburger nav on mobile; reduced particle count under 760px |
| Accessibility | `prefers-reduced-motion` respected, ARIA labels, keyboard `Esc` to close overlays |

## Structure

```
index.html          markup + content
css/style.css        theme, layout, animations
js/scene.js         Three.js background particle field (ES module, three via CDN import map)
js/character.js     hero 3D character — built from Three.js primitives, no model file
js/agent.js         knowledge base + retrieval logic  ← edit facts here
js/main.js          loader, nav, reveals, role rotator, chat widget wiring
```

## Run locally

Needs a local server (ES modules don't load from `file://`):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "3D portfolio + personal agent"
git branch -M main
git remote add origin https://github.com/FarhanRajputFelix/portfolio.git
git push -u origin main
```

Then: **repo → Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
The site is live at `https://FarhanRajputFelix.github.io/portfolio/` in a minute or two.
`.nojekyll` is included so Jekyll doesn't touch the asset folders.

## Updating the agent's answers

All facts live in the `KB` array in [js/agent.js](js/agent.js). Each entry is:

```js
{
  id: 'projects',
  keys: ['project', 'built', ...],      // single-word triggers
  phrases: ['what projects', ...],      // multi-word triggers, weighted higher
  answer: 'text the agent replies with'
}
```

Add an entry, and the agent can answer about it. If nothing scores high enough, the agent says
it doesn't know rather than inventing an answer.

---

## Contact

- Email — farhanmuhammadbashir@gmail.com
- LinkedIn — [in/farhan-rajput](https://www.linkedin.com/in/farhan-rajput/)
- GitHub — [FarhanRajputFelix](https://github.com/FarhanRajputFelix)
- Karachi, Pakistan
