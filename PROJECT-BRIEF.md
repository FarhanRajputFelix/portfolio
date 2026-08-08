# Project brief — Farhan Bashir portfolio

Everything the build week needs in one file: identity kit, one-line claim, content map, case
study outlines, and the list of proof still to gather. Paste this whole file into the Claude
Project so nothing has to be re-decided.

- **Live site:** https://FarhanRajputFelix.github.io/portfolio/
- **Repo:** https://github.com/FarhanRajputFelix/portfolio
- **Stack:** static HTML / CSS / vanilla JS + Three.js, hosted free on GitHub Pages. No build step,
  no framework, no backend, no API keys.

---

## 1. Identity kit

**Fonts (two, both free on Google Fonts)**
- `Space Grotesk` — headings, labels, numbers, the logo
- `Sora` — body copy
- No third font. Small uppercase labels are Space Grotesk at `0.28em` letter-spacing.

**Palette (four)**

| Role | Hex | Use |
|---|---|---|
| Ink | `#060608` | background, near-black |
| Paper | `#F4F4F6` | text, near-white |
| Violet | `#8B5CF6` | main — links, mark, focus, the one filled button |
| Cyan | `#22D3EE` | accent — the agent's face only |

Supporting neutrals: `#9D9DA8` muted text, `#0C0C10` card surface.
Violet tints `#7C5CFF` and `#A78BFA` for gradients only.

**Mark:** FB monogram built from real Space Grotesk outlines — `assets/brand/logo.svg`,
`favicon.svg`, `wordmark.svg`, `icon-32/180/512.png`.

**Mood:** a quiet near-black engineering lab. Heavy uppercase display type, generous whitespace,
colour only where it points at something. The work stays the loudest thing on the page.

**House rules**
1. One filled violet button per screen. If two things are violet, one is wrong.
2. Headings uppercase and tight (`-0.045em`); body sentence case, weight 300.
3. Cards are 1px hairline borders over a near-black surface, never heavy fills.
4. Motion 0.6–0.9s on `cubic-bezier(.16,1,.3,1)`; always respect `prefers-reduced-motion`.

---

## 2. The one action, and the claim

**One action:** email me about an AI/ML role, internship or research collaboration →
`farhanmuhammadbashir@gmail.com`. Every CTA either performs it or moves someone a step closer.

**One-line claim:** *"I build AI that knows its limits — and ships anyway."*

It is provable on the page itself: the agent refuses questions outside its knowledge base rather
than inventing answers, the AQI model reports a real R², and the hero says "CS student" rather
than "AI researcher" because there are no publications yet.

---

## 3. Content map

**Home — `/`** (live)

| # | Section | Content | CTA |
|---|---|---|---|
| 1 | Hero | Name, current role, claim, BYTE greeting unprompted | See my work ↓ |
| 2 | Ticker | Stack at a glance | — |
| 3 | About | Real photo, two paragraphs, four numbers | — |
| 4 | What I Do | ML · Agentic AI & LLMs · Full-stack · Learning & research | — |
| 5 | Work | 01 KIDO (leads) · 02 Air Quality R²≈0.97 · 03 Self-Regulating AI · 04 Crisis Intelligence · 05 This capstone · 06 Laravel/PHP | Ask BYTE |
| 6 | Certifications | 27 credentials (20 Anthropic, full catalogue), each linking to proof | Verify ↗ |
| 7 | Career | Internship, hackathon, degree, achievements, goals | — |
| 8 | Contact | Photo, email block, links, location, availability | **Write email ↗** |

**Process pages** (live): `/brand.html` identity kit · `/images.html` image audit ·
`/plan.html` content map and CTA ladder.

**Planned case studies**

`/case-kido.html` — Problem → What I built → Screens → Hard part (COPPA) → Next → *Email me*
`/case-aqi.html` — Question → Data & method → Result (R² ≈ 0.97 + plot) → What I'd fix → *Email me*

---

## 4. Case study source material

**KIDO** — AI-powered educational platform for children. Flutter client, FastAPI services,
PostgreSQL, Redis, Python, OpenAI APIs. Adaptive quizzes, AI tutor, gamification, learning
analytics, parent dashboard, teacher portal, COPPA-aware architecture. Widest scope of anything
built; leads the Work section.

**Air Quality Prediction** — Random Forest regressor predicting AQI from environmental datasets,
R² ≈ 0.97. The only case with a hard number, so it sits second.

**Self-Regulating AI System** — research prototype: adaptive agents that detect drift, hold
stability and self-correct via entropy-based regulation.

**Crisis Intelligence** — Google AI Seekho Antigravity Hackathon. Emergency response with AI
agents and live maps; Flutter, Firebase, Python backend. Built under time pressure, in a team.

**Portfolio + personal agent** (this capstone) — Three.js 3D portfolio with BYTE, a companion bot
built from primitives, answering from a local knowledge base with no API key or backend.

**Also shipped** — Laravel canteen management system, job portal, contact management system.

---

## 5. Still to gather

| Priority | What | Why |
|---|---|---|
| P1 | KIDO screenshots + 30s recording | Blocks the KIDO case study; strongest project has weakest evidence |
| P1 | AQI notebook + predicted-vs-actual plot | R² ≈ 0.97 is the only hard number and nothing backs it up yet |
| P1 | Public repo links per project | Cards promise "open the repo"; several are private |
| P2 | CV as PDF | Reviewers expect a download; site has no CV link |
| P2 | Hackathon artefacts | Submission page, demo clip or team photo |
| P2 | Before/after numbers | Quiz completion, tutor latency, training time |
| P3 | One testimonial | Supervisor, professor or teammate |
| P3 | FlyRank internship output | Not finished yet |
| P3 | Research proposal PDF | Listed as "research proposal author" with nothing to open |
