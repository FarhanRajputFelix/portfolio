# outreach-mcp — an MCP server for the FL-04 pipeline

FL-05 · Agent Concepts and MCP Basics. Explainer: [mcp.html](../mcp.html) ·
live at https://FarhanRajputFelix.github.io/portfolio/mcp.html

A zero-dependency MCP server that gives the [FL-04 outreach pipeline](../workflow.html) the three
things a chat window cannot do on its own: reach the live web, read a private local file, and write
state that outlives the conversation.

```
   Claude Desktop / Claude Code            outreach-mcp (this server)
   ────────────────────────────            ──────────────────────────
   host ── client ──── stdio ─────────────▶ TOOLS      fetch_posting
              JSON-RPC 2.0                            check_gpa_gate
                                                       log_run
                                           RESOURCES  cv-facts, project-brief,
                                                       7 run transcripts
                                           PROMPTS    the 5 pipeline steps
```

## The three primitives, and who drives each

| Primitive | Controlled by | Here |
|---|---|---|
| **Tools** | the **model** — it decides when to call | `fetch_posting`, `check_gpa_gate`, `log_run` |
| **Resources** | the **application** — the host decides what to attach | knowledge files + every run transcript, under `outreach://` |
| **Prompts** | the **user** — a human picks one from a menu | `step1_gather` … `step5_pack` |

## Files

| File | Role |
|---|---|
| `outreach-server.mjs` | The server. Zero dependencies, stdio transport, JSON-RPC 2.0. |
| `test-client.mjs` | A minimal MCP client that spawns the server and drives the real protocol. |
| `evidence/transcript.txt` | Full captured transcript of the run below — every request and response. |
| `../.mcp.json` | Client config, so Claude Code picks the server up from the repo root. |

## Run it

```bash
node mcp/test-client.mjs                 # full protocol transcript
node mcp/test-client.mjs > out.txt       # capture it
```

To use it from **Claude Code**: `.mcp.json` is already in the repo root — start Claude Code in this
directory and approve the server when prompted. Check with `/mcp`.

To use it from **Claude Desktop**: Settings → Developer → Edit Config, then add

```json
{
  "mcpServers": {
    "outreach": {
      "command": "node",
      "args": ["C:\\Users\\Laptronics.co\\OneDrive\\Desktop\\CAPSTON\\mcp\\outreach-server.mjs"]
    }
  }
}
```

Restart Claude Desktop; the tools appear under the connectors icon.

## The three tasks chat alone could not do

Verbatim results, from `evidence/transcript.txt`:

**1 · `fetch_posting` — live network I/O.** Fetched `https://sparai.org/`: HTTP 200, **358,124 bytes
of HTML** reduced to 12,931 characters of text, carrying the live deadline (*"Apply by August 18"*)
and *"230+ mentors for Fall 2026"*. A chat window cannot open a socket; without this tool the posting
has to be pasted by hand.

**2 · `check_gpa_gate` — reads a gitignored private file, returns only a verdict.** Against KAUST
VSRP's stated 3.5/4 minimum: **`VERDICT: FAIL`** → skip. Against a hypothetical 2.5/4 minimum:
**`VERDICT: PASS`** → continue. Both read `pipeline/private/cv-private.md`, which is gitignored and
has never been published — and **neither response contains the CGPA**. The tool answers the question
without moving the number off the machine. That boundary is the reason this is a tool and not a
paste.

**3 · `log_run` — persistent state.** Appended a row to `pipeline/runs/INDEX.md`, creating the file
on first call. Running the client twice appended **row 1 then row 2** — proving the state outlived
the process, which conversation history cannot do.

Plus, for completeness: `resources/read` returned the 16,039-character `cv-facts.md`;
`prompts/get step1_gather` returned the interpolated step-1 template; and `bogus/method` returned
JSON-RPC **`-32601 Method not found`** rather than crashing the server.

## Two implementation notes

**It answers two handshakes.** Spec revision `2026-07-28` is stateless — capabilities ride in
`_meta` on every request and discovery happens via `server/discover`. Most shipping clients still
send the older `initialize`. The server implements both and negotiates a mutually supported version
from `["2026-07-28", "2025-06-18", "2024-11-05"]`.

**Model-supplied paths are untrusted.** Every filesystem read resolves through `safePath()`, which
canonicalises the path and rejects anything that escapes the project root — so a resource URI cannot
be used to walk out of the repo.
