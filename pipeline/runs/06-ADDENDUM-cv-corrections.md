# Addendum — what the real CV and CGPA changed, after the five runs

Added 5 August 2026, a few hours after runs 1–5. Farhan supplied his Europass CV and his academic
standing. Both were absent when the pipeline ran, and both invalidate specific outputs above.

**The five runs are not edited.** They are a timestamped record of what the pipeline produced from the
knowledge files as they existed at 10:12–10:18 on 5 August 2026. Rewriting them to look correct in
hindsight would destroy the only thing that makes them evidence. Every correction is recorded here
instead, and `cv-facts.md` has been updated so future runs are right.

---

## 1. The retraction — I published a false claim about a false claim

The manual baseline (`00-MANUAL-BASELINE.md`) listed three defects. **Defect 2 was wrong and is
retracted.**

| | |
|---|---|
| What I published | "comfortable with … PyTorch — flatly untrue. `cv-facts.md` §5 lists PyTorch as an explicit non-skill." |
| The truth | **PyTorch is genuinely his.** It is in the AUREXIS tech stack and in the CV's Machine Learning skills section. |
| Why I got it wrong | I built `cv-facts.md` from the *website*, which lists TensorFlow and never mentions PyTorch. I then treated my own reconstruction as authoritative and called a true statement a lie. |
| Direction of the error | The dangerous direction. A knowledge file that wrongly *denies* a real skill makes the pipeline argue its owner out of jobs he is qualified for — and it does it with the full confidence of a rule that says "output NO EVIDENCE". |

The irony is worth stating plainly: the pipeline's whole thesis is that a claim needs evidence. The
evidence file itself was never audited against the source document. **The auditor had no auditor.**

**What survives from the baseline's defect list — 2 of 3, both confirmed by the CV:**

1. **"97% accuracy" — still wrong, and now provably so.** The CV gives R² = 0.9746 with
   MAE = 3.13 µg/m³ for a PM2.5 *regression*. Accuracy is not that model's metric.
2. **"essentially an alignment problem" — still an unsupported interpretive leap.** The CV describes
   Self-Regulating AI as homeostatic hyperparameter adaptation under drift. Nothing in it references
   alignment, and no benchmark is cited.
3. Also unchanged: the baseline hid the "no publications" gap, which SPAR explicitly says it does not
   require.

## 2. The CGPA resolves run 3 — KAUST is now a definite skip

The cumulative and most-recent-semester GPAs are recorded in `private/cv-private.md`, which is
gitignored and deliberately not published. The figures themselves are not repeated here.

Run 3 marked KAUST's "minimum GPA 3.5/4" as `NO EVIDENCE` and called it *apply with caveat*, with the
VERIFY BY HAND line naming the CGPA as the one fact that decided everything. It did decide it:

> **The cumulative GPA is below the 3.5/4 minimum, so run 3's verdict changes from "apply with
> caveat" to SKIP.** This is a screening gate
> applied before a human reads the file, so no amount of project evidence compensates.

That is the pipeline working exactly as designed — it refused to guess, named the deciding fact, and
the fact killed the application. Two of five postings are now correctly abandoned.

Mitacs ("meet grade requirements for their country") remains **unresolved** — the threshold is set per
country and not published on the main page. Check before writing anything.

## 3. Corrections that make the drafts stronger, not weaker

The CV is *better* than the knowledge file I reconstructed. Things the runs understated:

| Run | What it said | What the CV shows |
|---|---|---|
| 5 (Mistral) | MLOps `PARTIAL` — "the AQI regressor is a notebook result, not a served endpoint" | **Wrong.** It serves real-time inference through FastAPI. This is closer to `SUPPORTED`. |
| 5 (Mistral) | NLP thin; "no transformers, no embeddings" | Still true — but **PyTorch is real**, which materially changes how a GenAI team reads the application. |
| all | "several project repos are private; only `portfolio` confirmed public" | **Wrong.** `aurexis-core`, `KIDO`, `Air-Quality-Prediction` and `self-regulating-ai` are all public, plus a live demo at kido-orcin.vercel.app. |
| all | AUREXIS absent entirely | A 27-design-document, five-agent safety architecture — arguably the strongest research artefact he has, and no run mentioned it because it was in no knowledge file. |
| all | "no paid employment" | Two years as Retail Sales Manager (2019–2021). Non-technical, but real evidence for customer-facing and team-training requirements. |
| 1 (SPAR) | fit 7/10 | Unchanged, and the strongest of the five. SPAR requires no GPA, no transcript and no publications. |

## 4. The contradiction that has to be resolved by a human

**KIDO's stack is described two incompatible ways.** Website: Flutter, FastAPI, PostgreSQL, Redis,
Python, OpenAI APIs. CV: TypeScript, Kotlin, Node.js. These are disjoint. Run 5's draft told Mistral
"I built KIDO … on Flutter, FastAPI, PostgreSQL and Redis" — which, if the CV is the true version, is a
false statement sent to an employer who can open the public repo and check.

No pipeline can fix this. One of the two documents is wrong, and only Farhan knows which.
Until then `cv-facts.md` forbids any specific claim about KIDO's stack.

Same class of problem: TensorFlow (site) vs PyTorch (CV); Crisis Intelligence and the Laravel builds
appear on the site but not the CV; the ten Anthropic certificates are verifiable via skilljar but
absent from the CV.

## 5. New failure point — the one this addendum exists to record

**Failure point 9: the knowledge file was never audited against its source documents.**

Failure point 5 anticipated knowledge files going *stale* — facts becoming outdated. This is worse and
different: the file was **wrong on the day it was written**, because it was reconstructed from a
secondary source (a website) while the primary source (the CV) sat unread. Every downstream step
inherited the error with total confidence, and the adversarial audit could not catch it, because step 4
audits the draft against the evidence map — never the evidence map against reality.

**Human check, now permanent:** before a batch of applications, diff the knowledge files against the
actual CV, line by line. Where two sources disagree, resolve it or record the conflict — never let one
of them silently win. The pipeline is exactly as honest as its evidence file, and nothing inside the
pipeline can tell you the evidence file is lying.
