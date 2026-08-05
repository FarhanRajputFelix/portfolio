# RUN 4 — DAAD WISE 2027 (the run that ends in a skip)

**Input:** `inputs/04-daad-wise-2027.md` · source https://indiabioscience.org/grants/working-internships-in-science-and-engineering-wise-daad
**Started:** 2026-08-05 10:16:25 · **Finished:** 2026-08-05 10:17:03 · **Elapsed: 38 s** (halted at step 2)

This run exists to test whether the pipeline stops work rather than producing work. A pipeline that
always emits a polished email is worse than no pipeline, because the polish hides the fact that the
application was never viable.

---

## STEP 1 — GATHER (output verbatim)

```
DEADLINE: 1 November 2026, for internships running May, June or July 2027
CONTACT: not stated
REPEATED KEYWORDS: "Indian citizens", "science, engineering and mathematics",
                   "German supervisor"
REQUIREMENTS:
1. [must-have] applicants must be Indian citizens only
2. [must-have] enrolled in a 4-year undergraduate degree or a 5-year integrated
   master's degree
3. [must-have] in the 5th or 6th semester of a bachelor's degree
4. [must-have] studying at a selected DAAD WISE partner institution (IITs, NITs,
   IISERs, IIITs and selected others)
5. [must-have] field is science, engineering or mathematics
6. [must-have] must not have received a WISE scholarship before
7. [must-have] available 2-3 months between May and July 2027
```

## STEP 2 — EVIDENCE MAP (output verbatim)

```
1. [NO EVIDENCE] applicants must be Indian citizens only
   evidence: nationality is recorded as Pakistani. This is not a gap in my files -
   the file states the opposite of what the requirement demands. This requirement
   cannot be satisfied now or later.

2. [SUPPORTED] enrolled in a 4-year undergraduate degree
   evidence: BS Computer Science, SZABIST, Sept 2023 - 2027.

3. [NO EVIDENCE] in the 5th or 6th semester
   evidence: started Sept 2023, expected 2027 - by the November 2026 deadline that is
   approximately semester 7, past the window. The exact semester number is not
   recorded in the files.

4. [NO EVIDENCE] studying at a DAAD WISE partner institution
   evidence: SZABIST University, Karachi is a Pakistani institution and cannot be on
   a list of Indian partner institutes (IITs, NITs, IISERs, IIITs).

5. [SUPPORTED] field is science, engineering or mathematics
   evidence: BS Computer Science.

6. [SUPPORTED] no previous WISE scholarship
   evidence: no DAAD or WISE award anywhere in the files.

7. [NO EVIDENCE] available May-July 2027
   evidence: none - no calendar in the files.

FIT SCORE: 0/10, counting must-haves only
  Requirement 1 is a citizenship gate. It is not thin evidence, not a document I can
  obtain, and not a gap I can close. Requirements 3 and 4 fail independently for the
  same structural reason. The fit score is zero regardless of the three SUPPORTED
  rows, because must-haves are gates and not points.
CALL: skip
  One sentence why: I am not an Indian citizen, SZABIST is not a DAAD WISE partner
  institution, and I am past the 5th-6th semester window - three independent
  disqualifiers, none of them fixable.
BIGGEST GAP: not applicable. There is no version of my profile that becomes eligible
  for this programme, so there is nothing worth improving for it.

STOPPING HERE. Steps 3, 4 and 5 are not run. Producing a draft email for a programme
I am structurally ineligible for would be the pipeline working against me: it would
turn a clean 90-second decision into a wasted evening and a wasted application slot.
```

## STEPS 3, 4, 5 — not run

Deliberately halted at step 2 by the `CALL: skip` verdict.

**This is the behaviour being tested.** The DAAD WISE programme is promoted heavily on scholarship
blogs aimed at South Asian students, the funding is real (EUR 831/month plus EUR 1,050 travel), and
the eligibility line that disqualifies a Pakistani applicant sits below the funding details on most
of those pages. It is a genuinely easy mistake to make, and the manual method — read posting, feel
enthusiastic, start writing — makes it *first* and discovers the citizenship clause *later*.

---

## Run 4 result

| | |
|---|---|
| Fit score / call | **0/10 · skip** |
| Audit outcome | audit not reached — the pipeline halted two steps earlier |
| Human must verify | nothing. The disqualifier is stated on the posting in plain language and confirmed by the nationality line in `cv-facts.md`. |
| What the pipeline earned here | The most valuable run of the five, and the only one that produced no email. Requirements 1, 3 and 4 each fail independently, so no reordering of the profile rescues it. |

**Honest caveat about this run's timing.** It is the fastest of the five precisely *because* it
stopped early, so including it in the average per-run time flatters the pipeline. The time table in
`workflow.html` §04 reports the average both with and without it.
