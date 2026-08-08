#!/usr/bin/env python3
"""
new-case.py — scaffold the next case study.

Adding a case study to this site touches about twenty places: the page
itself, a sub-nav link on eleven pages, a footer link on six more, the
sitemap, and two cards on the homepage. I did that by hand eight times
while building the site and got it wrong twice — once shipping six pages
nothing linked to, once a page missing from the sitemap.

So the habit this assignment asks for is not "remember the steps". It is
"run the script, then write the words".

    python tools/new-case.py --slug case-self-regulating \\
        --title "Self-Regulating AI" \\
        --nav "Self-Regulating" \\
        --label "Case study 04 · Adaptive systems · 2026" \\
        --repo https://github.com/FarhanRajputFelix/self-regulating-ai

Then open the file and fill in the three beats. Nothing else to remember.
"""

import argparse
import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = "https://farhanbashir.netlify.app"

# Pages carrying the shared .subnav (css/case.css) versus the older pages that
# inline their own CSS and only have a footer link row.
SUBNAV_PAGES = [
    "cv.html", "case-aqi.html", "case-kido.html", "case-aurexis.html",
    "agent.html", "feature.html", "learned.html", "crit.html",
    "break.html", "fixes.html", "dns.html", "ugly.html",
]
FOOTER_PAGES = ["brand.html", "images.html", "plan.html", "stack.html",
                "workflow.html", "mcp.html"]

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} — Farhan Bashir</title>
<meta name="description" content="{desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@300;400;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/case.css" />
<link rel="canonical" href="{site}/{slug}.html" />
<link rel="icon" type="image/svg+xml" href="assets/brand/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="assets/brand/icon-180.png" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Farhan Bashir" />
<meta property="og:url" content="{site}/{slug}.html" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:image" content="{site}/assets/brand/og-card.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Farhan Bashir — I build AI that knows its limits, and ships anyway." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{desc}" />
<meta name="twitter:image" content="{site}/assets/brand/og-card.png" />
<meta name="theme-color" content="#060608" />
</head>
<body>
<div class="wrap">

  <nav class="subnav" aria-label="Site sections">
    <a class="home" href="./">← Farhan Bashir</a>
    <a href="cv.html">CV</a>
    <a href="case-aqi.html">Air Quality</a>
    <a href="case-kido.html">KIDO</a>
    <a href="case-aurexis.html">AUREXIS</a>
    <a href="{slug}.html" aria-current="page">{nav}</a>
    <a href="agent.html">Agent spec</a>
    <a href="crit.html">The crit</a>
    <a href="break.html">Where it breaks</a>
    <a href="ugly.html">Still ugly</a>
  </nav>

  <header class="top">
    <span class="label">{label}</span>
    <h1>{title}</h1>
    <p class="sub">TODO one sentence: what this is, and the single most interesting true thing
      about it. Write this last.</p>

    <div class="stats">
      <div class="stat"><b>TODO</b><span>the hard number</span></div>
      <div class="stat"><b>TODO</b><span>a second number, if one exists</span></div>
      <div class="stat accent"><b>TODO</b><span>the honest caveat</span></div>
    </div>

    <div class="pills">
      <span>TODO</span><span>stack</span><span>from the repo, not memory</span>
    </div>
  </header>

  <div class="tldr">
    <b>If you read one thing</b>
    <p>TODO the claim, in one sentence.</p>
    <p>TODO the limitation, in one sentence. Every page on this site has one.</p>
  </div>

  <!-- ============ BEAT 1 — THE PROBLEM ============ -->
  <section>
    <div class="sec-head"><span class="n">01</span><h2>The problem</h2></div>
    <p class="sub" style="margin-top:0">TODO what was actually wrong or unknown, before any
      solution is mentioned. Not "I wanted to learn X" — what did not work, or what could not be
      answered?</p>
  </section>

  <!-- ============ BEAT 2 — WHAT I DID ============ -->
  <section>
    <div class="sec-head"><span class="n">02</span><h2>What I did</h2></div>
    <p class="sub" style="margin-top:0">TODO the decisions, not the tutorial. For each: what were
      the options, and why this one?</p>
    <div class="scroll">
    <table>
      <thead><tr><th>Decision</th><th>What I did</th><th>Why</th></tr></thead>
      <tbody>
        <tr><td class="what">TODO</td><td class="why">TODO</td><td class="why">TODO</td></tr>
      </tbody>
    </table>
    </div>
  </section>

  <!-- ============ BEAT 3 — WHAT CAME OF IT ============ -->
  <section>
    <div class="sec-head"><span class="n">03</span><h2>What came of it</h2></div>
    <p class="sub" style="margin-top:0">TODO the result, with a number if one exists. If no number
      exists, say that instead of reaching for an adjective.</p>

    <div class="honest">
      <b>TODO what this does not show</b>
      <p>TODO the limitation, stated before a reader has to find it. Check it against
        <code>pipeline/cv-facts.md</code> — if the repo does not support a claim, the repo wins.</p>
    </div>

    <div class="links">
      <a href="{repo}">Repository ↗</a>
      <a href="mailto:farhanmuhammadbashir@gmail.com">Ask me about it ↗</a>
    </div>
  </section>

  <a class="flyrank-badge" href="mailto:verify@internship.flyrank.ai?subject=Verification%20request%20%E2%80%94%20Farhan%20Muhammad%20Bashir">
    <span class="fb-mark" aria-hidden="true">FR</span>
    <span class="fb-text">
      <b>FlyRank AI Internship</b>
      <i>General AI Fluency track · 23 assignments submitted · capstone in review</i>
    </span>
    <span class="fb-verify">Verify ↗</span>
  </a>

  <footer>
    <span>Farhan Bashir · Karachi, Pakistan</span>
    <span><a href="./">← Portfolio</a> · <a href="ugly.html">Still ugly</a></span>
  </footer>

</div>

<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "892aadd45cb448919272f9d8380aee65"}}'></script>
</body>
</html>
"""


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--slug", required=True, help="filename without .html, e.g. case-self-regulating")
    p.add_argument("--title", required=True)
    p.add_argument("--nav", required=True, help="short label for the nav, 1-2 words")
    p.add_argument("--label", default="Case study · 2026")
    p.add_argument("--repo", default="https://github.com/FarhanRajputFelix")
    p.add_argument("--desc", default="")
    a = p.parse_args()

    slug = a.slug.removesuffix(".html")
    path = f"{slug}.html"
    if os.path.exists(path):
        sys.exit(f"{path} already exists — refusing to overwrite")

    desc = a.desc or f"{a.title} — what the problem was, what I did, and what came of it."

    io.open(path, "w", encoding="utf-8", newline="").write(
        TEMPLATE.format(slug=slug, title=a.title, nav=a.nav, label=a.label,
                        repo=a.repo, desc=desc, site=SITE)
    )
    print(f"created  {path}")

    link = f'<a href="{path}">{a.nav}</a>'

    # sub-nav on the shared-CSS pages, inserted before "Agent spec"
    for f in SUBNAV_PAGES:
        if not os.path.exists(f):
            continue
        s = io.open(f, encoding="utf-8").read()
        if path in s:
            continue
        s2 = s.replace('    <a href="agent.html">', f"    {link}\n    <a href=\"agent.html\">", 1)
        if s2 != s:
            io.open(f, "w", encoding="utf-8", newline="").write(s2)
            print(f"  subnav   {f}")

    # footer link row on the older inline-CSS pages
    for f in FOOTER_PAGES:
        if not os.path.exists(f):
            continue
        s = io.open(f, encoding="utf-8").read()
        if path in s:
            continue
        s2 = s.replace('<a href="ugly.html">Still ugly</a>',
                       f"{link} · <a href=\"ugly.html\">Still ugly</a>", 1)
        if s2 != s:
            io.open(f, "w", encoding="utf-8", newline="").write(s2)
            print(f"  footer   {f}")

    # sitemap, so the link checker's both-directions test still passes
    sm = io.open("sitemap.xml", encoding="utf-8").read()
    if path not in sm:
        entry = (f"  <url>\n    <loc>{SITE}/{path}</loc>\n"
                 f"    <lastmod>2026-08-08</lastmod>\n    <priority>0.9</priority>\n  </url>\n")
        sm = sm.replace("</urlset>", entry + "</urlset>", 1)
        io.open("sitemap.xml", "w", encoding="utf-8", newline="").write(sm)
        print("  sitemap  added")

    # homepage: a card in the WORK grid
    idx = io.open("index.html", encoding="utf-8").read()
    if path not in idx:
        card = f"""      <article class="work" data-anim="rise" data-tilt>
        <div class="work-cover alt3">
          <span class="cover-index">NEW</span>
          <span class="cover-tag">CASE</span>
        </div>
        <div class="work-info">
          <h3>{a.title}</h3>
          <span class="work-kind">TODO one line</span>
          <p>TODO two lines, with the number in them.</p>
          <div class="pills small"><span>TODO</span></div>
          <a class="work-open" href="{path}">Read the case study →</a>
        </div>
      </article>

"""
        idx2 = idx.replace('      <article class="work" data-anim="rise" data-tilt>', card + '      <article class="work" data-anim="rise" data-tilt>', 1)
        if idx2 != idx:
            io.open("index.html", "w", encoding="utf-8", newline="").write(idx2)
            print("  homepage work card added")

    print(f"\nNow: open {path}, replace every TODO, then run")
    print("  python tools/check-links.py")
    print("  python tools/break-it.py      (after it deploys)")


if __name__ == "__main__":
    main()
