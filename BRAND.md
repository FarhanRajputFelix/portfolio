# Style note — Farhan Bashir portfolio

Paste this into the Claude Project so every new page and case study inherits the same decisions.

**Fonts:** Space Grotesk (headings, labels, numbers) + Sora (body). No third font — small uppercase
labels are Space Grotesk at `0.28em` letter-spacing.

**Palette:** `#060608` ink (background) · `#F4F4F6` paper (text) · `#8B5CF6` violet (main) ·
`#22D3EE` cyan (accent, used only on the agent's face). Supporting neutrals: `#9D9DA8` muted text,
`#0C0C10` card surface. Violet tints `#7C5CFF` and `#A78BFA` are for gradients only.

**Mood:** a quiet near-black engineering lab. Heavy uppercase display type, generous whitespace, and
colour only where it points at something — the work stays the loudest thing on the page.

---

## Assets

| File | Use |
|---|---|
| `assets/brand/logo.svg` | Primary mark, 512×512 tile |
| `assets/brand/favicon.svg` | Browser tab (tighter corner radius) |
| `assets/brand/wordmark.svg` | Full name set in Space Grotesk Bold |
| `assets/brand/icon-32.png` | Legacy favicon |
| `assets/brand/icon-180.png` | Apple touch icon |
| `assets/brand/icon-512.png` | PWA / social |

The mark is built from real Space Grotesk outlines (via fontTools), not a `<text>` element, so it
renders identically everywhere without loading a webfont.

## Live pages

- Portfolio — https://FarhanRajputFelix.github.io/portfolio/
- Identity kit — https://FarhanRajputFelix.github.io/portfolio/brand.html

## Rules of thumb

1. One accent per screen. If two things are violet, one of them is wrong.
2. Headings uppercase and tight (`-0.045em`); body sentence case and light (300).
3. Cards are `1px` hairline borders over a near-black surface, never heavy fills.
4. Motion is slow and short (0.6–0.9s) with `cubic-bezier(.16,1,.3,1)`; respect
   `prefers-reduced-motion`.
