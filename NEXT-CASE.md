# How to add the next case study

Written 8 August 2026, while I still remember how any of this works — which is
the whole point. In three months I will not remember that a case study touches
twenty files.

---

## Where it goes

A new page at the repository root, named `case-<slug>.html`, alongside
`case-aqi.html`, `case-kido.html` and `case-aurexis.html`. It uses
`css/case.css`, so it inherits the whole look and I never touch styling.

It also has to appear in **twenty other places** — a sub-nav link on twelve
pages, a footer link on six more, `sitemap.xml`, and a card in the homepage
WORK grid. That is the part that goes wrong. I hand-edited it eight times
building this site and got it wrong twice: once shipping six pages nothing
linked to, once a page missing from the sitemap.

So the steps are not a checklist to remember. They are a script.

## The steps

```bash
# 1. Scaffold. Creates the page and wires up all twenty places.
python tools/new-case.py \
    --slug case-self-regulating \
    --title "Self-Regulating AI" \
    --nav "Self-Regulating" \
    --label "Case study 04 · Adaptive systems · Feb 2026" \
    --repo https://github.com/FarhanRajputFelix/self-regulating-ai

# 2. Open the file. Replace every TODO. The template is already the three
#    beats, so there is no structure to invent — only facts to fill in.

# 3. Verify nothing is orphaned or missing from the sitemap.
python tools/check-links.py

# 4. Commit and push. GitHub Pages deploys immediately; Netlify follows.
git add -A && git commit -m "Add case study: Self-Regulating AI" && git push

# 5. After it deploys, attack it.
python tools/break-it.py
```

Realistically **20 minutes**, and 18 of those are writing.

## The three beats

The template enforces this shape, from the Week 2 exercise:

| Beat | The question it answers | The rule I keep breaking |
|---|---|---|
| **1. The problem** | What was wrong or unknown *before* any solution is mentioned? | Not "I wanted to learn X". What did not work, or could not be answered? |
| **2. What I did** | Which decisions, and why those over the alternatives? | Decisions, not a tutorial. Nobody needs my install steps. |
| **3. What came of it** | The result, with a number if one exists | If no number exists, say so. Do not reach for an adjective instead. |

Plus the fourth thing every page here has: **what it does not show.** Stated
before a reader has to find it. That is the claim the whole site makes, so a
page without it does not belong on this site.

## The rule that outranks everything

**Check every claim against the repository, not my memory.**

I have been wrong about my own projects three times: my site said KIDO ran on
Flutter and FastAPI when it runs on Next.js and TypeScript; my CV claimed an
MAE and a serving layer the air-quality repo does not document; and it listed
PyTorch for a project whose README says plainly it is rule-based.

`pipeline/cv-facts.md` now ranks sources: **repository README > CV > website.**
If the repo does not support a claim, the repo wins. Read it before writing,
not after a reviewer asks.

---

## The next piece: the opportunity board

**Status of the last one.** The previous entry here named *Self-Regulating AI*.
That shipped on 9 August 2026 — [`case-self-regulating.html`](case-self-regulating.html)
— so this file names the next one rather than leaving a finished task standing
as an intention. The rule this file exists to enforce applies to the file
itself: if it names work that is already done, it is decoration.

**Why this one.** It is the largest thing on the site with no write-up, and the
only one that is a running system rather than a finished experiment: eight
public feeds, two scheduled jobs, ~1,200 listings refreshed twice a day, and a
client-side eligibility matcher. It is also the piece with the most instructive
failures, and none of them are in the case studies yet.

**Repo:** the portfolio itself — `tools/fetch-jobs.py`,
`.github/workflows/jobs.yml`, `opportunities.html`.

**The three beats, sketched:**

1. **Problem** — job boards list what exists; none of them answer "can I apply
   for this?". For a Pakistani undergraduate the deciding lines are visa
   sponsorship and a GPA minimum, and those are exactly the lines that are
   missing, buried, or wrong. Four of the ten most-shared funded programmes on
   LinkedIn were wrong when checked against the official page; one was not
   running at all.
2. **What I did** — aggregate eight public feeds on a schedule instead of by
   hand; classify by type and field; give scarce categories a quota so 500
   ordinary jobs cannot bury 50 PhD places; and check a visitor's profile
   against stated requirements entirely in their browser, so a GPA band is
   compared without ever being transmitted.
3. **What came of it** — needs the number. Right now I can say 1,213 openings,
   18 fields, 336 ruled out for my own profile with a named reason. What I
   cannot yet say is whether the matcher is *right*.

**The real work before this can be written:** hand-check a random sample of
listings — 30 is enough — against what the matcher claims about each, and
publish the disagreement rate. Every other case study on this site carries a
number that survived a check. This one currently carries a count of rows, which
is not the same thing. If the matcher is wrong 1 in 5 times, that belongs in
beat 3 in bold.

**Target: by 8 September 2026.**

### After that, in order

1. **A performance case study** — Core Web Vitals before/after. I already have
   the before: LCP 25% Poor, INP 100% Poor, and a per-URL breakdown showing the
   homepage as the only red page. The fixes are committed. Once they deploy and
   a week of data accumulates, that is a case study with real numbers on both
   sides, which is rarer than it should be.
2. **Screenshots for the existing four.** Five case studies, zero images of
   anything running. Top of the still-ugly list for two weeks now.
3. **The missing baselines for Self-Regulating AI** — the case study shipped,
   but the repository still compares the regulator against fixed learning rate
   and step decay, not against the two schedules a practitioner would reach for.
   Carried over from the previous entry because it is still true.

---

## The reminder

- **Recurring calendar event, the 8th of each month, 20:00 PKT:**
  *"Portfolio: add or advance one case study — run `python tools/new-case.py`"*
- Importable file: [`next-case-reminder.ics`](next-case-reminder.ics) — opens
  straight into Google Calendar, Outlook or Apple Calendar.
- The event description carries the command, so I do not have to remember it or
  find this file first.

Monthly rather than weekly on purpose. A cadence I ignore is worse than none,
because ignoring it teaches me to ignore the next one.

## The build context, preserved

The expensive thing was never the HTML. It was establishing voice, palette,
type, and what may honestly be claimed. All of that is in the repo, so the next
case is a short conversation rather than a rebuild:

| File | What it holds |
|---|---|
| `PROJECT-BRIEF.md` | Identity, the one-line claim, the content map, the one action |
| `pipeline/cv-facts.md` | Every verifiable fact, all 27 credential IDs, the adjacent-but-absent table, the source-precedence rule |
| `pipeline/private/cv-private.md` | GPA, passport, phone. Gitignored, never published |
| `brand.html` | Two fonts, four colours, the monogram, the house rules |
| `plan.html` | Content map and CTA ladder |
| `css/case.css` | The shared look. New pages inherit it and need no styling |
| `tools/new-case.py` | The scaffold |
| `tools/check-links.py` | Reachability, broken links, sitemap agreement |
| `tools/break-it.py` | Links, form abuse, headers, metadata, weight |

Attach `PROJECT-BRIEF.md` and `pipeline/cv-facts.md` to the Claude Project and
it already knows the voice, the stack and what I am allowed to claim. The
Project instructions are in `pipeline/00-project-instructions.md`.

**The one habit that matters:** update `cv-facts.md` in the same commit as any
new claim. Everything on this site drifted from reality at least once, and every
time the cause was the same — a fact changed somewhere and the knowledge file
did not follow.
