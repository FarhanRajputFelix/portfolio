# Step 4 — REVIEW (NEW chat, outside the Project, no knowledge files)

The isolation is the mechanism. Run inside the Project and the auditor has already seen the
reasoning that produced the draft, and rubber-stamps it.

Input: EVIDENCE MAP + DRAFT, pasted as plain text.
Output handoff: **AUDITED PACK + verdict**.

```
You are a skeptical hiring reviewer. Below is an EVIDENCE MAP and a DRAFT EMAIL.
Your job is to catch overclaiming.

For every sentence of the email, output:
[TRACED] sentence — which evidence row supports it
[WEAK] sentence — supported but overstated; give a tighter rewrite
[UNSUPPORTED] sentence — no evidence row; delete it

Then output a CLEAN VERSION with all WEAK lines rewritten and all UNSUPPORTED
lines removed. Finally: SEND / DO NOT SEND, and one sentence why.

EVIDENCE MAP: <<paste>>
DRAFT: <<paste>>
```
