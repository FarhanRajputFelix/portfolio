# General AI Fluency — every deliverable, in one place

**Farhan · FlyRank AI internship · Machine Learning specialisation + General AI Fluency**

FL-10 asks for an index that links every deliverable from the whole track. This is
it. Everything below is live and public; nothing here needs a login.

**Live site:** <https://farhanrajputfelix.github.io/portfolio/>
**Repository:** <https://github.com/FarhanRajputFelix/portfolio>
**ML specialisation repo:** <https://github.com/FarhanRajputFelix/flyrank-ml-internship>

---

## The two things to look at first

| | |
|---|---|
| **[Opportunity Scout — the agent](agent/README.md)** | The FL-06/07/09 build. An agent that reads a posting and returns apply / caveat / skip, with six eval cases written before the code and guardrails enforced structurally. Includes a section naming exactly where AI did the work. |
| **[Opportunities — the tool anyone can use](https://farhanrajputfelix.github.io/portfolio/opportunities.html)** | ~1,200 live listings from eight public feeds, refreshed twice a day by two scheduled GitHub Actions, plus 13 hand-verified funded programmes. Eligibility checking runs in the visitor's browser; nothing is transmitted. |

---

## By assignment

| Code | Deliverable | Link |
|---|---|---|
| Week 2 | Case study 01 — Air Quality ML | [case-aqi.html](https://farhanrajputfelix.github.io/portfolio/case-aqi.html) |
| Week 2 | Case study 02 — KIDO | [case-kido.html](https://farhanrajputfelix.github.io/portfolio/case-kido.html) |
| Week 2 | Case study 03 — AUREXIS | [case-aurexis.html](https://farhanrajputfelix.github.io/portfolio/case-aurexis.html) |
| Week 2 | Case study 04 — Self-Regulating AI | [case-self-regulating.html](https://farhanrajputfelix.github.io/portfolio/case-self-regulating.html) |
| Week 3 | The through-line — content map and CTA ladder | [plan.html](https://farhanrajputfelix.github.io/portfolio/plan.html) |
| Week 3 | Identity kit — two fonts, four colours, and the frame-not-upstage rule | [brand.html](https://farhanrajputfelix.github.io/portfolio/brand.html) |
| Week 3 | Image audit — what I kept, what I killed, and why | [images.html](https://farhanrajputfelix.github.io/portfolio/images.html) |
| Week 4 | Three roads — the stack decision and the post-build evidence | [stack.html](https://farhanrajputfelix.github.io/portfolio/stack.html) |
| FL-04 | Automation workflow v2 — measured against a manual baseline | [workflow.html](https://farhanrajputfelix.github.io/portfolio/workflow.html) |
| FL-05 | Workflow vs agent, and what MCP actually is | [mcp.html](https://farhanrajputfelix.github.io/portfolio/mcp.html) |
| FL-06 | Agent design doc — written before the build, evals included | [agent.html](https://farhanrajputfelix.github.io/portfolio/agent.html) |
| FL-07 | The agent, built and run | [agent/scout.mjs](agent/scout.mjs) · [BUILD-LOG.md](agent/BUILD-LOG.md) |
| FL-09 | README and demo | [agent/README.md](agent/README.md) · demo video link in the portal submission |
| PF-04 | DNS walkthrough | [dns.html](https://farhanrajputfelix.github.io/portfolio/dns.html) |
| Week 5 | Still ugly — every flaw I already know about | [ugly.html](https://farhanrajputfelix.github.io/portfolio/ugly.html) |
| Week 6 | Explain it like you built it — one line I didn't understand | [learned.html](https://farhanrajputfelix.github.io/portfolio/learned.html) |
| Week 7 | Survive the crit — the review, the sort, the fixes | [crit.html](https://farhanrajputfelix.github.io/portfolio/crit.html) |
| Week 7 | Fix log — what was broken on a phone | [fixes.html](https://farhanrajputfelix.github.io/portfolio/fixes.html) |
| Week 8 | Make it do something — the contact form and what a backend is | [feature.html](https://farhanrajputfelix.github.io/portfolio/feature.html) |
| Week 9 | Break your own site — links, form abuse, injection, headers | [break.html](https://farhanrajputfelix.github.io/portfolio/break.html) |
| Week 10 | How to add the next case + the named next piece | [NEXT-CASE.md](NEXT-CASE.md) · [next-case-reminder.ics](next-case-reminder.ics) |
| FL-10 | Retrospective | [RETROSPECTIVE.md](RETROSPECTIVE.md) |
| — | CV | [cv.html](https://farhanrajputfelix.github.io/portfolio/cv.html) |

---

## Machine Learning specialisation (10/10 assignments)

Separate repository: <https://github.com/FarhanRajputFelix/flyrank-ml-internship>

| Deliverable | What it is |
|---|---|
| [Published research paper](https://farhanrajputfelix.github.io/flyrank-ml-internship/) | Deployed, four figures |
| `outputs/model_report.md` | Four methods compared on a client-holdout split. Random forest: ROC AUC 0.750, Precision@50 0.740 against 0.240 for the hand-written baseline |
| `work/PAPER_AUDIT.md` | Independent methodology audit of FlyRank's published March 2026 paper. 11 claims scored; one headline finding reverses on an independent slice |
| `work/EXPLAINER.md` | The five findings in plain language |

---

## The tooling behind the site

None of this is decoration; each one exists because something broke.

| Tool | Why it exists |
|---|---|
| [`tools/check-links.py`](tools/check-links.py) | Found six pages nothing linked to, and a page missing from the sitemap |
| [`tools/break-it.py`](tools/break-it.py) | Link integrity, form abuse, injection payloads, security headers, payload weight. 24 failures on the first run, now 0 |
| [`tools/fetch-jobs.py`](tools/fetch-jobs.py) | Aggregates eight public job feeds twice a day |
| [`tools/check-opportunities.py`](tools/check-opportunities.py) | Re-checks every source URL daily and fingerprints its visible text |
| [`tools/check-control-chars.py`](tools/check-control-chars.py) | Written after the same class of invisible bug shipped four times |
| [`tools/new-case.py`](tools/new-case.py) | Scaffolds a case study and wires it into all 20 places it has to appear |
| [`tools/set-base-url.py`](tools/set-base-url.py) | The site's canonical URL, in one command instead of 113 hand edits |

---

## Where AI did the work

Stated in full in [agent/README.md](agent/README.md#where-ai-did-the-work), and the
short version applies to the whole track: **this was built with Claude as a pair.**
The model did most of the typing. The decisions, the eval cases written before the
code, the structural guardrails, and every number checked against the thing it
describes were mine — and that checking caught real errors, including a result I
was about to publish that belonged to the baseline rather than to my method.
