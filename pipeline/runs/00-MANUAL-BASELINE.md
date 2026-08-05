# Manual baseline — one application, no pipeline

**Input used:** INPUT 1 (SPAR Fall 2026). Deliberately done *before* running the pipeline on it, so
the comparison isn't contaminated by having already seen the evidence map.

**Method:** read the posting, skim the portfolio and CV material to remember specifics, write the
email in one pass, reread once, done. No requirement extraction, no evidence map, no separate audit.
This is the honest "how it gets done on a normal evening" method.

**Started:** 2026-08-05 10:12:27
**Finished:** 2026-08-05 10:12:57
**Elapsed: 30 s of assistant wall-clock.**

> **Read that number correctly.** 30 s is machine time — one model pass plus tool latency. It is *not*
> how long this takes a human, and it must not be compared against a human's manual time. Every
> timing in this walkthrough is assistant wall-clock, measured with `date` before and after each step,
> and is only ever compared against other assistant wall-clock numbers. The human-time column in
> `workflow.html` §04 is left for Farhan to fill with a stopwatch, because nobody in this session can
> measure it for him.

---

## The manual output

**Subject:** Application — SPAR Fall 2026 mentee

Hi SPAR team,

I'm Farhan Bashir, a Computer Science undergraduate at SZABIST University in Karachi and currently
an AI intern at FlyRank AI. I'm applying to be a mentee in the Fall 2026 cohort.

My research interests sit squarely in AI safety and interpretability. I've built a Self-Regulating AI
System — adaptive agents that detect drift, hold stability and self-correct through entropy-based
regulation — which is essentially an alignment problem, and I've spent time on explainable and
responsible AI. On the applied side I trained a Random Forest model that reached 97% accuracy
predicting air quality, and I built KIDO, an AI education platform for children, where I had to think
hard about safety for a vulnerable user group.

I've completed the Anthropic AI Fluency certification series and hold 17 certifications overall. I'm
comfortable with Python, TensorFlow and PyTorch, and I can commit 15–20 hours a week.

I'd be grateful for the chance to contribute to an interpretability or societal-impact project.

Best,
Farhan Bashir

---

## What is wrong with it — found only when the pipeline was run on the same posting afterwards

This is why the baseline matters. Four defects, three of them factual:

| # | Defect | Severity |
|---|---|---|
| 1 | **"97% accuracy"** — the real figure is R² ≈ 0.97 on a *regression*. Accuracy is a classification metric. This is a different and unearned claim, and any ML reviewer would catch it. | **Factual error** |
| 2 | **"comfortable with … PyTorch"** — flatly untrue. `cv-facts.md` §5 lists PyTorch as an explicit non-skill. I typed it because it sits next to TensorFlow in my head. | **False claim** |
| 3 | **"essentially an alignment problem"** — an unsupported interpretive leap about my own prototype, stated as fact. The prototype was never evaluated against any alignment benchmark. | **Overclaim** |
| 4 | **No honest gap.** The posting explicitly says previous research experience is not required — so admitting "no publications yet" costs nothing and buys credibility. The manual draft hides it instead. | **Missed opportunity** |

Defect 2 is the exact substitution the pipeline's own failure-point list predicts ("Step 2 substitutes
a near-neighbour fact"). It occurred in the *manual* run, unprompted, in under five minutes — which is
the strongest argument for the audit step existing at all.
