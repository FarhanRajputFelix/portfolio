# RUN 5 — COLD RUN — Mistral AI, Applied AI / Forward Deployed ML Engineer (Internship)

**Input:** `inputs/05-COLD-RUN-mistral-applied-ai.md` · source https://www.welcometothejungle.com/en/companies/mistral-ai/jobs/applied-ai-engineer-paris-internship_paris
**Started:** 2026-08-05 10:17:03 · finish time stamped after the run, below.

**Cold-run conditions.** This is the evaluation criterion "workflow runs end to end on a brand new
input". The posting is a commercial engineering role, not a research programme or scholarship — a
different shape from all four inputs the pipeline was exercised on. Nothing was changed to
accommodate it: the Project instructions, both knowledge files and all five prompts were frozen
before this input was chosen. No prompt was retried, and the first output of each step is what is
recorded below.

---

## STEP 1 — GATHER (output verbatim)

```
DEADLINE: not stated
CONTACT: not stated
REPEATED KEYWORDS: "GenAI applications", "customers", "machine learning"
REQUIREMENTS:
1. [must-have] currently pursuing a degree in AI, data science, or a related field
2. [must-have] from a tier 1 engineering school or university
3. [must-have] strong programming skills in Python
4. [must-have] familiarity with machine learning algorithms and natural language
   processing techniques
5. [must-have] basic understanding of MLOps and deploying machine learning use cases
6. [must-have] good communication skills, with the ability to explain technical
   concepts to both technical and non-technical audiences
7. [nice-to-have] able to work in Paris for a 3-6 month internship
8. [nice-to-have] open to CIFRE programs as a continuation after the internship
```

## STEP 2 — EVIDENCE MAP (output verbatim)

```
1. [SUPPORTED] pursuing a degree in AI, data science or a related field
   evidence: BS Computer Science, SZABIST University, Sept 2023 - 2027, in progress.

2. [NO EVIDENCE] from a tier 1 engineering school or university
   evidence: SZABIST University, Karachi is recorded, but no ranking, tier or
   accreditation status appears in the files. I cannot assert this and will not
   characterise my own university's tier.

3. [SUPPORTED] strong programming skills in Python
   evidence: Python listed first among languages; used for the Random Forest AQI
   regressor (R^2 = 0.97), the Self-Regulating AI System prototype, KIDO's FastAPI
   services and the Crisis Intelligence backend.

4. [PARTIAL] ML algorithms and NLP techniques
   evidence: ML is solid - Random Forest regression at R^2 = 0.97, scikit-learn,
   TensorFlow, classification, regression, model evaluation
   thin: NLP is listed as a research interest, not as shipped work. The one language
   system I built (BYTE) is keyword and phrase retrieval over 19 entries, which is
   not NLP technique in the sense a GenAI team means it. No transformers, no
   embeddings, no fine-tuning (see the adjacent-but-absent table).

5. [PARTIAL] basic understanding of MLOps and deploying ML use cases
   evidence: Docker, AWS (AWS Academy Graduate - Cloud Foundations, 2026), GitHub
   Actions listed as tools; KIDO deployed with FastAPI, PostgreSQL and Redis
   thin: no evidence of deploying a *model* to production. The AQI regressor is a
   notebook result, not a served endpoint. "No production system with real users,
   uptime or scale numbers" is an explicit gap-list item.

6. [PARTIAL] communication to technical and non-technical audiences
   evidence: KIDO includes a parent dashboard and a teacher portal, i.e. non-technical
   user-facing surfaces; the portfolio and its process pages are written for a
   general reader; the Anthropic "Teaching the AI Fluency Framework" credential
   (zep7y3v3x8qk) covers designing AI curricula
   thin: no recorded presentation, talk or written technical explainer for an
   external audience.

7. [NO EVIDENCE] able to work in Paris for 3-6 months
   evidence: none. Location is Karachi, Pakistan; no visa or work-authorisation
   status for France is in the files (explicit gap-list item).

8. [NO EVIDENCE] open to CIFRE programs
   evidence: no record either way. CIFRE is a French doctoral arrangement and my
   files contain no plan regarding it.

FIT SCORE: 3/10, counting must-haves only
  (of 6 must-haves: 2 SUPPORTED, 3 PARTIAL, 1 NO EVIDENCE)
CALL: apply with caveat - the Python and ML foundations are real, but the role is a
  *GenAI deployment* role and my LLM work is prompt-level integration plus
  keyword retrieval, not transformer or embedding work. Two of the three PARTIALs
  sit exactly on the job's core.
BIGGEST GAP: one deployed model with a public endpoint. It would convert requirement
  5 from PARTIAL to SUPPORTED and is the single most valuable thing to build for
  roles of this shape.
```

## STEP 3 — DRAFT (output verbatim)

```
SUBJECT: Applied AI internship - Python, ML, honest about GenAI depth

EMAIL:
I'm applying for the Applied AI / Forward Deployed ML Engineer internship.

I'm a Computer Science undergraduate at SZABIST University (Sept 2023, expected
2027) and currently an AI intern at FlyRank AI. Python is where I do most of my
work: I trained a Random Forest regressor predicting AQI from environmental datasets
that scores R^2 = 0.97, and I built KIDO, an AI education platform on Flutter,
FastAPI, PostgreSQL and Redis with a parent dashboard and a teacher portal - which
is where the explaining-to-non-technical-users part came from.

My honest gap is GenAI depth: my LLM work is API integration and keyword retrieval,
not transformers, embeddings or fine-tuning. I'd be joining to close that gap, not
claiming it is closed.

Is the internship open to candidates who would need work authorisation for France?

CV TWEAKS:
1. Skills section - split "AI/ML" into "Machine learning (scikit-learn, TensorFlow)"
   and "LLM integration (API-level)" so the depth difference is visible rather than
   implied.
2. Projects section - lead KIDO with its deployment stack (FastAPI, PostgreSQL,
   Redis, Docker) rather than its features, since this role screens for MLOps.
3. Add a one-line Availability field stating location and work-authorisation status
   honestly, so a recruiter is not surprised at the screening call.
```

## STEP 4 — ADVERSARIAL AUDIT (fresh chat, output verbatim)

```
[TRACED] "I'm applying for the Applied AI / Forward Deployed ML Engineer
internship."
  -> the posting title.

[TRACED] "I'm a Computer Science undergraduate at SZABIST University (Sept 2023,
expected 2027) and currently an AI intern at FlyRank AI."
  -> row 1. Correctly does not claim a tier for the university (row 2 = NO
  EVIDENCE) and does not hide the institution either.

[TRACED] "Python is where I do most of my work: I trained a Random Forest regressor
predicting AQI from environmental datasets that scores R^2 = 0.97"
  -> row 3. Number exact, scope correct.

[WEAK] "I built KIDO, an AI education platform on Flutter, FastAPI, PostgreSQL and
Redis with a parent dashboard and a teacher portal - which is where the
explaining-to-non-technical-users part came from."
  -> row 6 supports the surfaces existing. But "which is where the explaining came
  from" implies I personally explained technical concepts to those users; the
  evidence is that I *built interfaces for* non-technical users. Adjacent, not the
  same.
  REWRITE: "...with a parent dashboard and a teacher portal, both built for
  non-technical users."

[TRACED] "My honest gap is GenAI depth: my LLM work is API integration and keyword
retrieval, not transformers, embeddings or fine-tuning."
  -> row 4 thin-note and the adjacent-but-absent table. This is the strongest
  sentence in the email: it states the limitation in the exact terms the team would
  use to test it.

[TRACED] "I'd be joining to close that gap, not claiming it is closed."
  -> a statement of intent, no factual content.

[TRACED] "Is the internship open to candidates who would need work authorisation for
France?"
  -> row 7. Correctly asks rather than assumes.

[UNSUPPORTED] none.

CLEAN VERSION:
I'm applying for the Applied AI / Forward Deployed ML Engineer internship.

I'm a Computer Science undergraduate at SZABIST University (Sept 2023, expected
2027) and currently an AI intern at FlyRank AI. Python is where I do most of my
work: I trained a Random Forest regressor predicting AQI from environmental datasets
that scores R^2 = 0.97, and I built KIDO, an AI education platform on Flutter,
FastAPI, PostgreSQL and Redis, with a parent dashboard and a teacher portal, both
built for non-technical users.

My honest gap is GenAI depth: my LLM work is API integration and keyword retrieval,
not transformers, embeddings or fine-tuning. I'd be joining to close that gap, not
claiming it is closed.

Is the internship open to candidates who would need work authorisation for France?

VERDICT: SEND
One sentence why: nothing overstates the stack, the GenAI limitation is named in the
team's own vocabulary rather than buried, and the visa question is asked up front
instead of discovered at screening.
```

**Audit caught:** 1 WEAK (built-for-non-technical-users vs. explained-to-non-technical-users).
0 UNSUPPORTED.

## STEP 5 — PACK (output verbatim)

```
--- OUTREACH PACK ---
ORG / PROGRAMME: Mistral AI - Applied AI, Forward Deployed ML Engineer (Internship),
                 Paris
DEADLINE: not stated - rolling
FIT SCORE: 3/10
SUBJECT: Applied AI internship - Python, ML, honest about GenAI depth

EMAIL: [clean version from step 4]

CV TWEAKS:
1. Split "AI/ML" into "Machine learning (scikit-learn, TensorFlow)" and "LLM
   integration (API-level)".
2. Lead KIDO with its deployment stack, not its features.
3. Add an Availability line with location and work-authorisation status.

VERIFY BY HAND: whether this role sponsors or requires existing French work
authorisation. The pipeline returned NO EVIDENCE on requirement 7 and the answer
determines whether the application is viable at all.
--- END ---
```

---

## Run 5 result — cold run verdict

| | |
|---|---|
| Fit score / call | **3/10 · apply with caveat** |
| Audit outcome | 1 WEAK rewritten, 0 UNSUPPORTED, verdict SEND |
| Human must verify | visa / work-authorisation requirement for the role |
| **Ran end to end on a brand new input?** | **Yes.** All five steps completed on a posting shape the pipeline had never seen, with zero prompt edits and no retries. |

**What the cold run proved.** The step that mattered most was step 2 refusing requirement 2 ("tier 1
engineering school"). A pipeline tuned to flatter would have written something like "from a leading
university in Pakistan". The instruction "if something is missing, output NO EVIDENCE" held on a
requirement about *status* rather than skill, which is the category it had never been tested on.

**What the cold run exposed.** Requirement 8 (CIFRE) was marked NO EVIDENCE, which is technically
correct but useless — it is a question about future intent, not a fact about my history. The evidence
map has no category for "this is a preference I should simply decide". Recorded as a failure point.
