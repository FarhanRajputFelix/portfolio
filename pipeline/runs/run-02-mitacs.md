# RUN 2 — Mitacs Globalink Research Internship 2027

**Input:** `inputs/02-mitacs-globalink-2027.md` · source https://www.mitacs.ca/our-programs/globalink-research-internship/
**Started:** 2026-08-05 10:14:28 · **Finished:** 2026-08-05 10:15:25 · **Elapsed: 57 s**

---

## STEP 1 — GATHER (output verbatim)

```
DEADLINE: faculty call 10 June 2026 1:00 P.M. PT; student call "opens in summer",
          specific date not stated
CONTACT: not stated
REPEATED KEYWORDS: "12-week", "eligible institution", "research internship"
REQUIREMENTS:
1. [must-have] at least 18 years of age at the time of application
2. [must-have] enrolled in a full-time undergraduate or combined
   undergraduate/master's program at an eligible institution
3. [must-have] one to three semesters remaining in their program as of fall 2027
4. [must-have] meet grade requirements for their country
5. [must-have] fluent in the oral and written language of the project (English
   and/or French)
6. [must-have] available to complete an internship lasting 12 consecutive weeks
   between May 1 and October 31
7. [must-have] not previously awarded a Globalink Research Internship
8. [must-have] apply to a minimum of three and a maximum of ten projects, from at
   least three different Canadian provinces
9. [must-have] a reference letter from a professor
10. [must-have] a CV
11. [must-have] academic transcripts (in either English or French)
12. [nice-to-have] language proficiency test results (where required by country)
```

## STEP 2 — EVIDENCE MAP (output verbatim)

```
1. [SUPPORTED] at least 18
   evidence: enrolled in a BS since Sept 2023, currently in an internship - cannot
   be under 18. (Date of birth is not in the files; the inference is from enrolment.)

2. [NO EVIDENCE] enrolled at an *eligible institution*
   evidence: SZABIST University, Karachi is confirmed as my institution. Whether
   SZABIST appears on Mitacs's eligible-institution list is not in the files and
   cannot be determined from them. This is a hard gate, not a soft one.

3. [PARTIAL] one to three semesters remaining as of fall 2027
   evidence: BS Computer Science, Sept 2023 - 2027 (expected graduation 2027)
   thin: if the degree completes in mid-2027 there are ZERO semesters remaining by
   fall 2027, which would make me ineligible. The files record the year 2027 but not
   the graduation month. This single unknown decides eligibility.

4. [NO EVIDENCE] meet grade requirements for my country
   evidence: none - no GPA or CGPA is recorded in the files (gap list item 2).

5. [SUPPORTED] fluent in English, written and oral
   evidence: English is working proficiency; all coursework, the FlyRank internship
   and the portfolio are in English.

6. [NO EVIDENCE] available 12 consecutive weeks between 1 May and 31 Oct
   evidence: none - the files contain no calendar.

7. [SUPPORTED] not previously awarded a Globalink internship
   evidence: no Mitacs or Globalink award appears anywhere in the files.

8. [NO EVIDENCE] apply to 3-10 projects across 3+ provinces
   evidence: not applicable to my history - this is a task to perform, not a
   qualification to hold. Flagging it so it is not mistaken for a satisfied
   requirement.

9. [NO EVIDENCE] reference letter from a professor
   evidence: none - "no named referees or testimonials" (gap list item 4).

10. [PARTIAL] a CV
    evidence: full CV content exists across the knowledge files
    thin: no CV PDF exists yet (P2 gap in the project brief). The document has to be
    produced.

11. [NO EVIDENCE] academic transcripts in English or French
    evidence: none - no transcript is recorded or held.

12. [NO EVIDENCE] language proficiency test results
    evidence: none - no IELTS or TOEFL score in the files.

FIT SCORE: 3/10, counting must-haves only
  (of 11 must-haves: 3 SUPPORTED, 2 PARTIAL, 6 NO EVIDENCE)
CALL: apply with caveat - and the caveat is administrative, not academic. The
  research background is fine; what is missing is paperwork (transcripts, referee,
  GPA) plus two unresolved eligibility gates (institution list, graduation month).
BIGGEST GAP: requirement 3. Until the graduation month is known, every other piece
  of effort here is a gamble. Resolve it before writing anything.
```

## STEP 3 — DRAFT (output verbatim)

```
SUBJECT: Globalink 2027 - eligibility check before I apply

EMAIL:
I'm considering applying to Globalink 2027 and would rather confirm eligibility than
submit a doomed application.

I'm a Computer Science undergraduate at SZABIST University in Karachi, Pakistan
(listed as an eligible country), currently an AI intern at FlyRank AI. My work is in
machine learning: I trained a Random Forest regressor predicting AQI from
environmental datasets, scoring R^2 = 0.97, and I built an AI education platform for
children on Flutter and FastAPI.

Two things I cannot resolve from the public page: whether SZABIST University is an
eligible institution, and how "one to three semesters remaining as of fall 2027" is
counted for a degree scheduled to finish in 2027.

Could you confirm both? If I'm eligible I'll prepare the reference letter and
transcripts before the student call opens.

CV TWEAKS:
1. Education section - state the exact graduation month, not just "2027". This
   application turns on it.
2. Add a Research Interests line naming three concrete project areas, since Globalink
   requires selecting 3-10 specific projects.
3. Skills section - lead with Python, scikit-learn and TensorFlow; drop the Laravel
   and PHP work to the bottom for a research application.
```

## STEP 4 — ADVERSARIAL AUDIT (fresh chat, output verbatim)

```
[TRACED] "I'm considering applying to Globalink 2027 and would rather confirm
eligibility than submit a doomed application."
  -> rows 2 and 3. Correct posture given two unresolved gates.

[WEAK] "I'm a Computer Science undergraduate at SZABIST University in Karachi,
Pakistan (listed as an eligible country)"
  -> row 2 supports the institution; the eligible-*country* claim comes from the
  posting, not from the evidence map, and the requirement is an eligible
  *institution*. Stating the country as if it settled the matter is misdirection.
  REWRITE: "...at SZABIST University in Karachi, Pakistan. I can see Pakistan on
  the eligible-country list, but not whether SZABIST is an eligible institution."

[TRACED] "currently an AI intern at FlyRank AI"
  -> row 1 / experience section.

[TRACED] "I trained a Random Forest regressor predicting AQI from environmental
datasets, scoring R^2 = 0.97"
  -> project row. Number quoted exactly, scope correct.

[TRACED] "I built an AI education platform for children on Flutter and FastAPI."
  -> KIDO project row.

[TRACED] "Two things I cannot resolve from the public page..."
  -> rows 2 and 3, stated as open questions rather than assumed answers.

[WEAK] "If I'm eligible I'll prepare the reference letter and transcripts before
the student call opens."
  -> rows 9 and 11 are both NO EVIDENCE. The sentence is a promise, not a claim, so
  it is not unsupported - but "prepare" understates that neither exists yet and a
  referee has to agree first.
  REWRITE: "If I'm eligible, my next steps are to ask a faculty member for the
  reference letter and request official transcripts - neither is in hand yet."

[UNSUPPORTED] none.

CLEAN VERSION:
I'm considering applying to Globalink 2027 and would rather confirm eligibility than
submit a doomed application.

I'm a Computer Science undergraduate at SZABIST University in Karachi, Pakistan. I
can see Pakistan on the eligible-country list, but not whether SZABIST is an
eligible institution. I'm currently an AI intern at FlyRank AI. My work is in
machine learning: I trained a Random Forest regressor predicting AQI from
environmental datasets, scoring R^2 = 0.97, and I built an AI education platform for
children on Flutter and FastAPI.

The second thing I cannot resolve from the public page is how "one to three
semesters remaining as of fall 2027" is counted for a degree scheduled to finish in
2027.

Could you confirm both? If I'm eligible, my next steps are to ask a faculty member
for the reference letter and request official transcripts - neither is in hand yet.

VERDICT: SEND
One sentence why: it is an eligibility enquiry rather than an application, which is
the correct move when two hard gates are unresolved, and it no longer implies that
Pakistan's eligibility settles the institution question.
```

**Audit caught:** 2 WEAK (country-vs-institution misdirection; overstated readiness of documents).
0 UNSUPPORTED.

## STEP 5 — PACK (output verbatim)

```
--- OUTREACH PACK ---
ORG / PROGRAMME: Mitacs Globalink Research Internship (GRI) 2027, Canada
DEADLINE: student call opens summer 2026, date not stated; faculty call closed
          10 June 2026
FIT SCORE: 3/10
SUBJECT: Globalink 2027 - eligibility check before I apply

EMAIL: [clean version from step 4]

CV TWEAKS:
1. Education - state the exact graduation month.
2. Add a Research Interests line naming three concrete project areas.
3. Skills - Python/scikit-learn/TensorFlow first; Laravel and PHP last.

VERIFY BY HAND: whether SZABIST University is on the Mitacs eligible-institution
list. This is a hard gate and the pipeline returned NO EVIDENCE. Check
mitacs.ca/en/programs/gl before spending another minute on this application.
--- END ---
```

---

## Run 2 result

| | |
|---|---|
| Fit score / call | **3/10 · apply with caveat** |
| Audit outcome | 2 WEAK rewritten, 0 UNSUPPORTED, verdict SEND (as an enquiry, not an application) |
| Human must verify | SZABIST on the eligible-institution list; exact graduation month |
| What the pipeline earned here | It converted a 12-requirement posting into two specific blocking questions, and stopped a full application being written before either was answered. |
