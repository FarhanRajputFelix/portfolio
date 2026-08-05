# Opportunity → claim-checked outreach pack

The working files for **FL-04 · Ship an Automation Workflow v2** (Week 4, General AI Fluency).
Walkthrough with the diagram, time accounting and failure points:
[workflow.html](../workflow.html) · live at
https://FarhanRajputFelix.github.io/portfolio/workflow.html

A five-step no-code pipeline that turns a posting into a fit assessment plus a send-ready email whose
every sentence traces back to evidence — or gets deleted.

```
posting ─▶ 1 GATHER ─▶ requirement list
                        │
                        ▼
             2 SYNTHESIZE ─▶ evidence map + fit score ──▶ CALL: skip? ─▶ STOP
                        │
                        ▼
                 3 DRAFT ─▶ draft pack
                        │
                        ▼   (new chat, no Project knowledge)
                4 REVIEW ─▶ audited pack + SEND / DO NOT SEND
                        │
                        ▼
                5 FORMAT ─▶ outreach pack + VERIFY BY HAND
```

## Files

| File | Role |
|---|---|
| `00-project-instructions.md` | Paste into the Claude Project instructions field |
| `cv-facts.md` | Knowledge file 2 — facts with credential IDs, the adjacent-but-absent table, the numbered gap list |
| `../PROJECT-BRIEF.md` | Knowledge file 1 — identity, projects, claim |
| `01-gather.md` … `05-format.md` | The five step prompts, one per file |
| `inputs/` | The five real postings, each with source URL and gather date |
| `runs/00-MANUAL-BASELINE.md` | One application written without the pipeline, and the three defects it shipped |
| `runs/run-01…05-*.md` | Verbatim output of every step of every run |

## To run it

1. New Claude Project → paste `00-project-instructions.md` into the instructions.
2. Attach `PROJECT-BRIEF.md` and `cv-facts.md` as Project knowledge.
3. Steps 1 → 2 → 3 in one Project chat.
4. **Step 4 in a new chat, outside the Project.** The isolation is the mechanism: inside the Project
   the auditor has already seen the reasoning that produced the draft and rubber-stamps it.
5. Step 5 back in the Project chat.

## Results, in short

| Run | Input | Fit / call | Audit caught | Time |
|---|---|---|---|---|
| — | manual baseline (no pipeline) | — | **3 factual defects shipped** | 0:30 |
| 1 | SPAR Fall 2026 | 7/10 apply | 1 WEAK | 1:31 |
| 2 | Mitacs Globalink 2027 | 3/10 caveat | 2 WEAK | 0:57 |
| 3 | KAUST VSRP | 4/10 conditional | 1 WEAK + **1 UNSUPPORTED deleted** | 1:00 |
| 4 | DAAD WISE 2027 | **0/10 skip** | halted at step 2 | 0:38 |
| 5 | **COLD** Mistral AI, Paris | 3/10 caveat | 1 WEAK | 1:07 |

All timings are **assistant wall-clock**, stamped with `date` before and after each step. They are
machine time, not human time, and are only compared against each other.

**The honest headline:** the pipeline is **2.1× slower** per run than writing the email by hand. It
never breaks even on time. What it returns instead is 3 fewer factual errors (the manual baseline
claimed PyTorch experience I don't have, and reported R² ≈ 0.97 as "97% accuracy"), and one
application in five correctly abandoned before a word was written. See
[workflow.html §04](../workflow.html) for the full accounting, and §05 for the eight failure points —
three of which were discovered only by running it.
