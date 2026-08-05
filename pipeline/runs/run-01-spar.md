# RUN 1 — SPAR Fall 2026 mentee application

**Input:** `inputs/01-spar-fall-2026.md` · source https://sparai.org/
**Started:** 2026-08-05 10:12:57 · **assistant wall-clock, see baseline note**

---

## STEP 1 — GATHER (output verbatim)

```
DEADLINE: 18 August 2026 (mentee applications open 28 July – 18 August 2026)
CONTACT: not stated
REPEATED KEYWORDS: "AI safety", "research project", "mentee"
REQUIREMENTS:
1. [must-have] open to undergraduate, graduate/PhD students, and professionals of
   different experience levels
2. [must-have] commit 5-40 hours/week, depending on your availability
3. [must-have] available for the research period 14 September - 14 December 2026
4. [must-have] present work at Demo Day (19 December 2026)
5. [nice-to-have] technical background (ML, CS, math, physics, biology) OR policy
   expertise (law, public policy, economics)
6. [nice-to-have] interest in AI safety, policy, security, interpretability,
   biosecurity, and societal impacts of AI
7. [nice-to-have] previous research experience - explicitly stated as NOT required
```

## STEP 2 — EVIDENCE MAP (output verbatim)

```
1. [SUPPORTED] open to undergraduates
   evidence: BS Computer Science, SZABIST University, Sept 2023 - 2027, in progress

2. [PARTIAL] commit 5-40 hours/week
   evidence: currently AI Intern at FlyRank AI (July 2026 - present, remote)
   thin: the knowledge files record no weekly availability figure at all. Any number
   I state is Farhan's to confirm, not mine to infer.

3. [NO EVIDENCE] available 14 Sept - 14 Dec 2026
   evidence: none. The files contain no calendar, no term dates and no record of
   other commitments in that window.

4. [PARTIAL] present at Demo Day
   evidence: "Collaborative project leader" and team hackathon work (Antigravity,
   Google AI Seekho 2026)
   thin: no recorded talk, presentation or demo delivered to an audience.

5. [SUPPORTED] technical background in ML/CS
   evidence: Random Forest AQI regressor, R^2 = 0.97; Python, scikit-learn,
   TensorFlow, Pandas, NumPy; BS Computer Science

6. [SUPPORTED] interest in AI safety / interpretability / societal impact
   evidence: research interests include Responsible AI, Explainable AI, Human-AI
   Interaction; Self-Regulating AI System prototype (agents that detect drift, hold
   stability, self-correct via entropy-based regulation); the BYTE agent refuses
   questions outside its 19-entry knowledge base rather than inventing answers

7. [NO EVIDENCE] previous research experience
   evidence: none - no publications, preprints or citations (gap list item 1).
   Note: the posting states this is not required.

FIT SCORE: 7/10, counting must-haves only
  (1 SUPPORTED, 2 PARTIAL, 1 NO EVIDENCE - but every must-have failure is
  logistical, not a credential I lack. Nothing here requires a qualification I
  don't hold.)
CALL: apply - the one thing the programme says it does not require (research
  experience) is my only real gap, and the technical background it does want is
  documented.
BIGGEST GAP: no research output anyone can read. A public write-up of the
  Self-Regulating AI prototype would fix this faster than any new credential.
```

## STEP 3 — DRAFT (output verbatim)

```
SUBJECT: SPAR Fall 2026 mentee - CS undergrad, interpretability

EMAIL:
I'm applying to the SPAR Fall 2026 cohort because it is one of the few programmes
that takes people who have the technical background but not yet the research
record.

I'm a Computer Science undergraduate at SZABIST University (graduating 2027) and
currently an AI intern at FlyRank AI. I trained a Random Forest regressor that
predicts air quality with R^2 = 0.97, and I built a prototype of self-regulating
agents that detect drift and self-correct through entropy-based regulation.

My honest gap is that I have no publications yet - the prototype has never been
written up or evaluated against a benchmark, which is exactly the discipline I
want mentorship for.

I'd like to be considered for an interpretability or societal-impact project. I
can confirm my weekly hours and September-December availability on request.

CV TWEAKS:
1. Research section - lead with "Self-Regulating AI System: adaptive agents that
   detect drift and self-correct via entropy-based regulation (prototype, not yet
   evaluated)" instead of listing it fourth among projects.
2. Skills section - move Responsible AI and Explainable AI up next to Python and
   scikit-learn, since this application is judged on safety interest, not stack
   breadth.
3. Certifications section - name the five verifiable Anthropic credentials with
   their IDs rather than the count "10 from Anthropic Academy".
```

## STEP 4 — ADVERSARIAL AUDIT (fresh chat, no Project, output verbatim)

```
[TRACED] "I'm applying to the SPAR Fall 2026 cohort because it is one of the few
programmes that takes people who have the technical background but not yet the
research record."
  -> rows 1, 5, 7. Accurate framing of the posting's own statement.

[TRACED] "I'm a Computer Science undergraduate at SZABIST University (graduating
2027) and currently an AI intern at FlyRank AI."
  -> row 1.

[WEAK] "I trained a Random Forest regressor that predicts air quality with
R^2 = 0.97"
  -> row 5 supports the number, but "predicts air quality" overstates scope: the
  evidence says AQI predicted from environmental datasets, an offline dataset
  result, not a deployed forecaster.
  REWRITE: "I trained a Random Forest regressor that predicts AQI from
  environmental datasets, scoring R^2 = 0.97."

[TRACED] "I built a prototype of self-regulating agents that detect drift and
self-correct through entropy-based regulation."
  -> row 6. "Prototype" is correctly hedged.

[TRACED] "My honest gap is that I have no publications yet - the prototype has
never been written up or evaluated against a benchmark"
  -> row 7 plus the biggest-gap line. Volunteering it is correct here.

[TRACED] "I'd like to be considered for an interpretability or societal-impact
project."
  -> row 6.

[TRACED] "I can confirm my weekly hours and September-December availability on
request."
  -> rows 2 and 3. Correctly does NOT assert a number the files don't hold.

CLEAN VERSION:
I'm applying to the SPAR Fall 2026 cohort because it is one of the few programmes
that takes people who have the technical background but not yet the research
record.

I'm a Computer Science undergraduate at SZABIST University (graduating 2027) and
currently an AI intern at FlyRank AI. I trained a Random Forest regressor that
predicts AQI from environmental datasets, scoring R^2 = 0.97, and I built a
prototype of self-regulating agents that detect drift and self-correct through
entropy-based regulation.

My honest gap is that I have no publications yet - the prototype has never been
written up or evaluated against a benchmark, which is exactly the discipline I
want mentorship for.

I'd like to be considered for an interpretability or societal-impact project. I
can confirm my weekly hours and September-December availability on request.

VERDICT: SEND
One sentence why: every claim traces to an evidence row, the single overstatement
was scope rather than substance and is now corrected, and the gap is stated
plainly rather than hidden.
```

**Audit caught:** 1 WEAK (scope inflation: "predicts air quality" → "predicts AQI from
environmental datasets"). 0 UNSUPPORTED.

## STEP 5 — PACK (output verbatim)

```
--- OUTREACH PACK ---
ORG / PROGRAMME: SPAR (Supervised Program for Alignment Research) - Fall 2026 mentee
DEADLINE: 18 August 2026
FIT SCORE: 7/10
SUBJECT: SPAR Fall 2026 mentee - CS undergrad, interpretability

EMAIL:
I'm applying to the SPAR Fall 2026 cohort because it is one of the few programmes
that takes people who have the technical background but not yet the research
record.

I'm a Computer Science undergraduate at SZABIST University (graduating 2027) and
currently an AI intern at FlyRank AI. I trained a Random Forest regressor that
predicts AQI from environmental datasets, scoring R^2 = 0.97, and I built a
prototype of self-regulating agents that detect drift and self-correct through
entropy-based regulation.

My honest gap is that I have no publications yet - the prototype has never been
written up or evaluated against a benchmark, which is exactly the discipline I
want mentorship for.

I'd like to be considered for an interpretability or societal-impact project. I
can confirm my weekly hours and September-December availability on request.

CV TWEAKS:
1. Research section - lead with the Self-Regulating AI System, flagged as an
   unevaluated prototype.
2. Skills section - Responsible AI and Explainable AI up next to Python.
3. Certifications - name the five verifiable Anthropic credentials with IDs.

VERIFY BY HAND: my actual availability for 14 Sept - 14 Dec 2026 against the
SZABIST term calendar, and the real number of hours per week I can commit. The
pipeline flagged both as NO EVIDENCE / PARTIAL and cannot resolve either.
--- END ---
```

---

## Run 1 result

| | |
|---|---|
| Fit score / call | **7/10 · apply** |
| Audit outcome | 1 WEAK rewritten, 0 UNSUPPORTED, verdict SEND |
| Human must verify | term-calendar availability + weekly hours |
| Vs. the manual baseline on the same posting | manual version contained "97% accuracy" (wrong metric), "comfortable with PyTorch" (false), and "essentially an alignment problem" (unsupported). The pipeline produced none of the three. |
