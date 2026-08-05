# RUN 3 — KAUST Visiting Student Research Program (VSRP)

**Input:** `inputs/03-kaust-vsrp.md` · source https://admissions.kaust.edu.sa/study/internships
**Started:** 2026-08-05 10:15:25 · **Finished:** 2026-08-05 10:16:25 · **Elapsed: 1 min 00 s**

---

## STEP 1 — GATHER (output verbatim)

```
DEADLINE: not stated - "applications accepted all year round"
CONTACT: not stated
REPEATED KEYWORDS: "STEM", "research", "faculty-led projects"
REQUIREMENTS:
1. [must-have] 3rd or 4th-year bachelor's student, or master's student
2. [must-have] field is science, technology, engineering or mathematics (STEM)
3. [must-have] minimum GPA 3.5/4
4. [must-have] English language proficiency (official test scores may be required
   upon evaluation)
5. [must-have] valid passport with at least 6 months validity
6. [must-have] not a current PhD candidate, KAUST student or KAUST alumnus
7. [must-have] official transcript(s) in English for all degrees
8. [must-have] letter of recommendation from a faculty member
9. [must-have] statement of purpose
10. [must-have] curriculum vitae (CV)
11. [nice-to-have] research interests aligned to one of 100+ faculty-led projects
```

## STEP 2 — EVIDENCE MAP (output verbatim)

```
1. [SUPPORTED] 3rd or 4th-year bachelor's student
   evidence: BS Computer Science at SZABIST, started Sept 2023, expected 2027. In
   August 2026 that places me in year 4 of 4.

2. [SUPPORTED] STEM field
   evidence: BS Computer Science.

3. [NO EVIDENCE] minimum GPA 3.5/4
   evidence: none. No GPA or CGPA is recorded in the knowledge files (gap list
   item 2). This is a hard numeric gate and I cannot assert it. Note: I must not
   report this as "likely met" - the file simply does not know.

4. [PARTIAL] English proficiency
   evidence: English is working proficiency - all coursework, the FlyRank internship
   and the portfolio are in English
   thin: no IELTS or TOEFL score exists, and the posting says official test scores
   may be required upon evaluation.

5. [NO EVIDENCE] valid passport with 6+ months validity
   evidence: none. Nationality is recorded as Pakistani; no passport or expiry date
   is in the files.

6. [SUPPORTED] not a PhD candidate, KAUST student or alumnus
   evidence: education history contains only SZABIST; no PhD enrolment and no KAUST
   affiliation anywhere in the files.

7. [NO EVIDENCE] official transcripts in English
   evidence: none held.

8. [NO EVIDENCE] letter of recommendation from a faculty member
   evidence: none - no named referees (gap list item 4).

9. [NO EVIDENCE] statement of purpose
   evidence: not written. Note: research goals and interests in the files are strong
   raw material for one, but the document does not exist.

10. [PARTIAL] CV
    evidence: full CV content exists across the knowledge files
    thin: no CV PDF exists yet.

11. [SUPPORTED] research interests align with faculty-led STEM projects
    evidence: 15 stated research areas including ML, deep learning, agentic AI, LLMs,
    computer vision, NLP, AI for healthcare and AI for sustainability; a Random Forest
    AQI regressor at R^2 = 0.97 as applied evidence.

FIT SCORE: 4/10, counting must-haves only
  (of 10 must-haves: 4 SUPPORTED, 2 PARTIAL, 4 NO EVIDENCE)
CALL: apply with caveat - conditional entirely on requirement 3. If the CGPA is
  below 3.5/4 this is a skip, and no amount of project evidence compensates, because
  the GPA gate is checked before a human reads the application.
BIGGEST GAP: the GPA is unknown to the pipeline and decides everything. Second is
  the recommendation letter, which needs a faculty member to say yes and therefore
  has the longest lead time.
```

## STEP 3 — DRAFT (output verbatim)

```
SUBJECT: VSRP application - CS final year, ML and agentic AI

EMAIL:
I'd like to apply to VSRP for a machine learning or agentic AI project.

I'm a final-year Computer Science undergraduate at SZABIST University in Karachi
(BS, Sept 2023 - 2027), currently an AI intern at FlyRank AI. On the ML side I
trained a Random Forest regressor that predicts AQI from environmental datasets,
scoring R^2 = 0.97. On the agentic side I built a prototype of self-regulating
agents that detect drift and self-correct through entropy-based regulation, and a
retrieval agent that refuses questions outside its knowledge base rather than
inventing answers.

I have no publications yet, which is what I want a supervised research placement
for.

I'm preparing transcripts, a recommendation letter and a statement of purpose now.
Could you confirm which faculty projects are open for a 3-6 month placement
starting early 2027?

CV TWEAKS:
1. Education section - add the CGPA on its own line. VSRP screens on 3.5/4 before
   anything else is read.
2. Projects section - retitle the AQI project "Random Forest AQI regression
   (R^2 = 0.97)" so the number is in the heading, not the body.
3. Add a Research Statement block of two lines naming the two KAUST-relevant areas
   (ML, agentic AI) instead of listing all 15 interests.
```

## STEP 4 — ADVERSARIAL AUDIT (fresh chat, output verbatim)

```
[TRACED] "I'd like to apply to VSRP for a machine learning or agentic AI project."
  -> row 11.

[WEAK] "I'm a final-year Computer Science undergraduate at SZABIST University in
Karachi (BS, Sept 2023 - 2027)"
  -> row 1 supports 3rd/4th year. "Final-year" is an inference from Sept 2023 + 2027
  expected; if the programme runs longer or a semester was repeated it is wrong.
  REWRITE: "I'm a Computer Science undergraduate at SZABIST University in Karachi
  (BS, Sept 2023, expected 2027), currently in my fourth year."

[TRACED] "currently an AI intern at FlyRank AI"
  -> experience section.

[TRACED] "I trained a Random Forest regressor that predicts AQI from environmental
datasets, scoring R^2 = 0.97."
  -> row 11 evidence. Exact.

[TRACED] "I built a prototype of self-regulating agents that detect drift and
self-correct through entropy-based regulation, and a retrieval agent that refuses
questions outside its knowledge base rather than inventing answers."
  -> project rows. "Prototype" correctly hedged.

[TRACED] "I have no publications yet, which is what I want a supervised research
placement for."
  -> gap list item 1.

[UNSUPPORTED] "I'm preparing transcripts, a recommendation letter and a statement of
purpose now."
  -> rows 7, 8 and 9 are all NO EVIDENCE. Nothing in the evidence map indicates any
  of the three has been started, and the recommendation letter depends on a third
  party who has not been asked. As written it is a claim about present activity that
  the evidence does not support. DELETE, or replace with a commitment rather than a
  status.
  REPLACEMENT: "If my CGPA meets the 3.5/4 threshold I'll submit transcripts, a
  faculty recommendation and a statement of purpose with the full application."

[TRACED] "Could you confirm which faculty projects are open for a 3-6 month
placement starting early 2027?"
  -> posting states 2-6 months, year-round starts. Within scope.

CLEAN VERSION:
I'd like to apply to VSRP for a machine learning or agentic AI project.

I'm a Computer Science undergraduate at SZABIST University in Karachi (BS, Sept
2023, expected 2027), currently in my fourth year and an AI intern at FlyRank AI. On
the ML side I trained a Random Forest regressor that predicts AQI from environmental
datasets, scoring R^2 = 0.97. On the agentic side I built a prototype of
self-regulating agents that detect drift and self-correct through entropy-based
regulation, and a retrieval agent that refuses questions outside its knowledge base
rather than inventing answers.

I have no publications yet, which is what I want a supervised research placement
for.

If my CGPA meets the 3.5/4 threshold I'll submit transcripts, a faculty
recommendation and a statement of purpose with the full application. Could you
confirm which faculty projects are open for a 3-6 month placement starting early
2027?

VERDICT: SEND - but only after the CGPA is checked against 3.5/4. If it is below,
do not send at all.
One sentence why: the technical claims all trace and the number is exact, but the
draft originally asserted document progress that does not exist, and the whole
application is void below the GPA threshold.
```

**Audit caught:** 1 WEAK ("final-year" as an unhedged inference), **1 UNSUPPORTED** — a claim that
three documents were being prepared when none exist. This is the first run where the audit deleted a
sentence rather than softening it.

## STEP 5 — PACK (output verbatim)

```
--- OUTREACH PACK ---
ORG / PROGRAMME: KAUST Visiting Student Research Program (VSRP), Saudi Arabia
DEADLINE: none - accepted all year round
FIT SCORE: 4/10
SUBJECT: VSRP application - CS final year, ML and agentic AI

EMAIL: [clean version from step 4]

CV TWEAKS:
1. Education - add CGPA on its own line.
2. Retitle the AQI project so R^2 = 0.97 sits in the heading.
3. Add a two-line research statement naming ML and agentic AI only.

VERIFY BY HAND: my actual CGPA against the 3.5/4 minimum. The pipeline returned NO
EVIDENCE and this single number decides whether the application is worth writing.
Also confirm passport validity is 6+ months.
--- END ---
```

---

## Run 3 result

| | |
|---|---|
| Fit score / call | **4/10 · apply with caveat, conditional on CGPA** |
| Audit outcome | 1 WEAK rewritten, **1 UNSUPPORTED deleted**, verdict SEND-if-GPA-clears |
| Human must verify | CGPA ≥ 3.5/4; passport validity |
| Note | The audit step caught the draft step inventing progress on documents ("I'm preparing transcripts…") purely because it read well. Neither the Project instructions nor the draft prompt forbade *process* claims — only skill and credential claims. That is a real gap in the prompt design, recorded as a new failure point. |
