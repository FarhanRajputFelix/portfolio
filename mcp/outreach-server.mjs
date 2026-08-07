#!/usr/bin/env node
/**
 * outreach-mcp — an MCP server for the FL-04 "Opportunity -> outreach pack" pipeline.
 *
 * FL-05 · Agent Concepts and MCP Basics · Farhan Bashir
 *
 * Zero dependencies. Speaks JSON-RPC 2.0 over stdio (newline-delimited), which is
 * MCP's stdio transport. Written against spec revision 2026-07-28 but it also
 * answers the older `initialize` handshake, because most shipping clients still
 * send that. Exposes all three server primitives:
 *
 *   TOOLS     (model-controlled)       fetch_posting, check_gpa_gate, log_run
 *   RESOURCES (application-controlled) the knowledge files + every run transcript
 *   PROMPTS   (user-controlled)        the five pipeline steps, as templates
 *
 * Design note on check_gpa_gate: it reads a gitignored private file and returns
 * only a PASS/FAIL verdict — never the CGPA itself. The secret stays on the
 * machine; the model gets the decision. That boundary is the whole point of
 * putting this behind a tool instead of pasting the file into a chat.
 *
 * Run:  node mcp/outreach-server.mjs        (then speak JSON-RPC on stdin)
 * Test: node mcp/test-client.mjs
 */

import { readFile, writeFile, readdir, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const PIPELINE = join(REPO, "pipeline");

const SERVER_INFO = { name: "outreach-mcp", version: "1.0.0" };
const PROTOCOL_VERSIONS = ["2026-07-28", "2025-06-18", "2024-11-05"];

const log = (...a) => process.stderr.write(`[outreach-mcp] ${a.join(" ")}\n`);

/* ------------------------------------------------------------------ *
 * Path safety: every file this server touches must stay inside REPO.
 * Model-supplied paths are untrusted input.
 * ------------------------------------------------------------------ */
function safePath(relative) {
  const full = resolve(REPO, relative);
  if (full !== REPO && !full.startsWith(REPO + "\\") && !full.startsWith(REPO + "/")) {
    throw new Error(`path escapes the project root: ${relative}`);
  }
  return full;
}

/* ================================================================== *
 * TOOLS — model-controlled: the model decides when to call these.
 * ================================================================== */

const TOOLS = [
  {
    name: "fetch_posting",
    title: "Fetch a live posting",
    description:
      "Fetch a job, internship or scholarship posting from a live URL and return it as plain text, " +
      "ready for step 1 (GATHER) of the outreach pipeline. Use this instead of asking the user to " +
      "paste a posting. Returns the text, the final URL after redirects, and the fetch timestamp.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The posting URL (http/https)." },
        max_chars: {
          type: "integer",
          description: "Truncate the extracted text to this many characters (default 2500).",
          default: 2500,
        },
      },
      required: ["url"],
    },
  },
  {
    name: "check_gpa_gate",
    title: "Check a GPA gate without revealing the GPA",
    description:
      "Evaluate whether Farhan's cumulative GPA clears a programme's minimum, by reading the " +
      "gitignored private file pipeline/private/cv-private.md. Returns only PASS or FAIL plus the " +
      "threshold that was tested — never the CGPA itself, so the number stays local.\n\n" +
      "WHEN TO CALL: only when the posting states an explicit numeric GPA or CGPA minimum you can " +
      "quote verbatim (e.g. KAUST VSRP: \"Minimum GPA: 3.5/4\").\n\n" +
      "WHEN NOT TO CALL: if the posting does not mention a GPA at all. Most do not. Calling this " +
      "with a threshold you invented will return FAIL and cause a qualified candidate to be " +
      "rejected for a requirement that does not exist. Never pass a guessed threshold.",
    inputSchema: {
      type: "object",
      properties: {
        threshold: { type: "number", description: "The minimum GPA the posting requires." },
        scale: { type: "number", description: "The scale it is out of (default 4.0).", default: 4.0 },
        programme: { type: "string", description: "Programme name, for the audit line." },
      },
      required: ["threshold"],
    },
  },
  {
    name: "log_run",
    title: "Append a run to the pipeline index",
    description:
      "Record a completed pipeline run in pipeline/runs/INDEX.md so the run history persists across " +
      "sessions. Call this at the end of step 5 (PACK), or after a step-2 skip verdict. Creates the " +
      "index file if it does not exist and returns the resulting row count.",
    inputSchema: {
      type: "object",
      properties: {
        programme: { type: "string", description: "Organisation or programme name." },
        fit_score: { type: "string", description: "Fit score as written, e.g. \"7/10\"." },
        call: {
          type: "string",
          enum: ["apply", "apply with caveat", "skip"],
          description: "The step-2 verdict.",
        },
        verify_by_hand: { type: "string", description: "The one fact a human must confirm." },
        source_url: { type: "string", description: "Where the posting came from." },
      },
      required: ["programme", "call"],
    },
  },
];

async function callTool(name, args = {}) {
  switch (name) {
    /* ---- 1. live network I/O -------------------------------------- */
    case "fetch_posting": {
      const { url, max_chars = 2500 } = args;
      if (!/^https?:\/\//i.test(url || "")) throw new Error("url must start with http:// or https://");

      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "outreach-mcp/1.0 (FlyRank FL-05 coursework)" },
      });
      const html = await res.text();

      // A 404 or 500 still returns a body, and an error page is usually long
      // enough to look like a successful extraction. Caught by eval E6.
      if (!res.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `FETCH FAILED — HTTP ${res.status} ${res.statusText} for ${res.url}\n` +
                `The response body is an error page, not a posting. Do not extract requirements ` +
                `from it and do not infer any. Ask the user for a working URL or the posting text.`,
            },
          ],
        };
      }

      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
        .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      const clipped = text.slice(0, max_chars);
      return {
        content: [
          {
            type: "text",
            text:
              `FETCHED: ${res.url}\n` +
              `HTTP: ${res.status} ${res.statusText}\n` +
              `BYTES OF HTML: ${html.length}\n` +
              `CHARS OF TEXT: ${text.length}${text.length > max_chars ? ` (clipped to ${max_chars})` : ""}\n` +
              `--- POSTING TEXT ---\n${clipped}`,
          },
        ],
      };
    }

    /* ---- 2. reads a private local file, returns only a verdict ----- */
    case "check_gpa_gate": {
      const { threshold, scale = 4.0, programme = "(unnamed programme)" } = args;
      if (typeof threshold !== "number") throw new Error("threshold must be a number");

      const priv = safePath(join("pipeline", "private", "cv-private.md"));
      if (!existsSync(priv)) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                "NO EVIDENCE — pipeline/private/cv-private.md is not present on this machine, so the " +
                "GPA gate cannot be evaluated. This is the correct pipeline answer, not an error to " +
                "work around: do not guess the CGPA.",
            },
          ],
        };
      }

      const body = await readFile(priv, "utf8");
      const m = body.match(/CGPA \(cumulative\)[^|]*\|\s*\*\*([\d.]+)\s*\/\s*([\d.]+)\*\*/);
      if (!m) throw new Error("could not locate the CGPA row in the private file");

      const cgpa = parseFloat(m[1]);
      const onScale = parseFloat(m[2]);
      const normalised = (cgpa / onScale) * scale;
      const pass = normalised >= threshold;

      return {
        content: [
          {
            type: "text",
            text:
              `GATE: ${programme} requires ${threshold}/${scale}\n` +
              `VERDICT: ${pass ? "PASS" : "FAIL"}\n` +
              `CALL: ${pass ? "the GPA gate is clear — continue the pipeline" : "SKIP — a GPA gate is screened before a human reads the application, so no project evidence compensates"}\n` +
              `SOURCE: pipeline/private/cv-private.md (gitignored, never published)\n` +
              `DISCLOSURE: the CGPA itself is deliberately not returned. This tool answers the ` +
              `question without moving the number off the machine.`,
          },
        ],
      };
    }

    /* ---- 3. persistent filesystem write --------------------------- */
    case "log_run": {
      const { programme, fit_score = "—", call, verify_by_hand = "—", source_url = "—" } = args;
      const index = safePath(join("pipeline", "runs", "INDEX.md"));

      if (!existsSync(index)) {
        await writeFile(
          index,
          "# Run index\n\n" +
            "Appended by the `log_run` tool of `outreach-mcp` (see ../../mcp/). One row per pipeline\n" +
            "run, so the history survives across sessions instead of living in a chat transcript.\n\n" +
            "| # | Programme | Fit | Call | Verify by hand | Source |\n" +
            "|---|---|---|---|---|---|\n",
          "utf8"
        );
      }

      const existing = await readFile(index, "utf8");
      const rows = existing.split("\n").filter((l) => /^\| \d+ \|/.test(l)).length;
      const n = rows + 1;

      await appendFile(
        index,
        `| ${n} | ${programme} | ${fit_score} | ${call} | ${verify_by_hand} | ${source_url} |\n`,
        "utf8"
      );

      return {
        content: [
          {
            type: "text",
            text:
              `LOGGED row ${n} to pipeline/runs/INDEX.md\n` +
              `programme: ${programme}\ncall: ${call}\nfit: ${fit_score}\n` +
              `The index now holds ${n} run${n === 1 ? "" : "s"}. This survives the session — it is a ` +
              `file on disk, not conversation history.`,
          },
        ],
      };
    }

    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

/* ================================================================== *
 * RESOURCES — application-controlled: the host decides what to attach.
 * ================================================================== */

async function listResources() {
  const fixed = [
    {
      uri: "outreach://knowledge/cv-facts",
      name: "cv-facts.md",
      title: "Knowledge file 2 — CV facts, credential IDs, gap list",
      mimeType: "text/markdown",
      description:
        "Every fact with a credential ID, the adjacent-but-absent table, and the numbered gap list " +
        "that makes NO EVIDENCE a definite answer.",
    },
    {
      uri: "outreach://knowledge/project-brief",
      name: "PROJECT-BRIEF.md",
      title: "Knowledge file 1 — identity, projects, claim",
      mimeType: "text/markdown",
    },
  ];

  let runs = [];
  try {
    runs = (await readdir(join(PIPELINE, "runs")))
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({
        uri: `outreach://runs/${f.replace(/\.md$/, "")}`,
        name: f,
        title: `Run transcript — ${f}`,
        mimeType: "text/markdown",
      }));
  } catch {
    /* runs/ may not exist yet */
  }

  return [...fixed, ...runs];
}

async function readResource(uri) {
  let rel;
  if (uri === "outreach://knowledge/cv-facts") rel = join("pipeline", "cv-facts.md");
  else if (uri === "outreach://knowledge/project-brief") rel = "PROJECT-BRIEF.md";
  else if (uri.startsWith("outreach://runs/")) {
    const slug = basename(uri.slice("outreach://runs/".length));
    rel = join("pipeline", "runs", `${slug}.md`);
  } else throw new Error(`unknown resource uri: ${uri}`);

  const text = await readFile(safePath(rel), "utf8");
  return { contents: [{ uri, mimeType: "text/markdown", text }] };
}

/* ================================================================== *
 * PROMPTS — user-controlled: the human picks these from a menu.
 * ================================================================== */

const PROMPTS = [
  {
    name: "step1_gather",
    title: "Step 1 — GATHER",
    description: "Turn a raw posting into a tagged requirement list.",
    arguments: [{ name: "posting", description: "Raw posting text.", required: true }],
  },
  {
    name: "step2_evidence_map",
    title: "Step 2 — EVIDENCE MAP",
    description: "Map each requirement to evidence; emit a fit score and an apply/skip call.",
    arguments: [],
  },
  {
    name: "step3_draft",
    title: "Step 3 — DRAFT",
    description: "Draft the email and three CV tweaks from SUPPORTED/PARTIAL rows only.",
    arguments: [],
  },
  {
    name: "step4_audit",
    title: "Step 4 — ADVERSARIAL AUDIT (run in a fresh chat)",
    description: "Trace every sentence to an evidence row, or cut it.",
    arguments: [
      { name: "evidence_map", description: "The step-2 output.", required: true },
      { name: "draft", description: "The step-3 output.", required: true },
    ],
  },
  {
    name: "step5_pack",
    title: "Step 5 — PACK",
    description: "Assemble the send-ready outreach pack.",
    arguments: [],
  },
];

const PROMPT_TEXT = {
  step1_gather: (a) =>
    `STEP 1 of 5 — GATHER.\nHere is a posting. Extract, in this exact format:\n\n` +
    `DEADLINE: (date or "not stated")\nCONTACT: (name/email or "not stated")\n` +
    `REPEATED KEYWORDS: (the 3 phrases the posting uses most)\nREQUIREMENTS:\n` +
    `1. [must-have|nice-to-have] requirement, in the posting's own words\n2. ...\n\n` +
    `Do not comment on my fit yet. Do not invent requirements that are not written.\n\n` +
    `POSTING:\n${a.posting ?? "<<paste raw posting>>"}`,

  step2_evidence_map: () =>
    `STEP 2 of 5 — EVIDENCE MAP.\nUsing ONLY the knowledge files, map each requirement from the ` +
    `list above.\n\nFor each, output:\nN. [SUPPORTED|PARTIAL|NO EVIDENCE] — requirement\n` +
    `   evidence: the specific project, credential or number from my files\n` +
    `   (for PARTIAL, name exactly what is thin)\n\nThen:\n` +
    `FIT SCORE: x/10, counting must-haves only\nCALL: apply / apply with caveat / skip — and one ` +
    `sentence why\nBIGGEST GAP: the single thing that would most improve my case\n\n` +
    `If a requirement states a minimum GPA, call the check_gpa_gate tool rather than guessing.`,

  step3_draft: () =>
    `STEP 3 of 5 — DRAFT.\nWrite, using only SUPPORTED and PARTIAL rows:\n\n` +
    `SUBJECT: (under 60 characters, specific, no buzzwords)\nEMAIL: 150 words max. Structure: why ` +
    `them (1 sentence), my strongest matching evidence with the number attached (2 sentences), one ` +
    `honest gap and how I am closing it (1 sentence), a clear ask (1 sentence). No "I am passionate ` +
    `about".\nCV TWEAKS: exactly 3, each naming the section and the new wording.\n\n` +
    `Anything marked NO EVIDENCE is forbidden. Do not hint at it. Do not claim work is in progress ` +
    `unless it actually is.`,

  step4_audit: (a) =>
    `You are a skeptical hiring reviewer. Below is an EVIDENCE MAP and a DRAFT EMAIL.\nYour job is ` +
    `to catch overclaiming.\n\nFor every sentence of the email, output:\n` +
    `[TRACED] sentence — which evidence row supports it\n` +
    `[WEAK] sentence — supported but overstated; give a tighter rewrite\n` +
    `[UNSUPPORTED] sentence — no evidence row; delete it\n\nThen output a CLEAN VERSION with all ` +
    `WEAK lines rewritten and all UNSUPPORTED lines removed. Finally: SEND / DO NOT SEND, and one ` +
    `sentence why.\n\nEVIDENCE MAP: ${a.evidence_map ?? "<<paste>>"}\nDRAFT: ${a.draft ?? "<<paste>>"}`,

  step5_pack: () =>
    `STEP 5 of 5 — PACK.\nAssemble the audited email into this exact block:\n\n` +
    `--- OUTREACH PACK ---\nORG / PROGRAMME:\nDEADLINE:\nFIT SCORE:      /10\nSUBJECT:\nEMAIL:\n` +
    `CV TWEAKS: 1. 2. 3.\nVERIFY BY HAND: (the one fact I must confirm before sending)\n--- END ---\n\n` +
    `Then call the log_run tool to record this run in the index.`,
};

/* ================================================================== *
 * JSON-RPC dispatch
 * ================================================================== */

const CAPABILITIES = { tools: { listChanged: false }, resources: {}, prompts: {} };

async function handle(method, params = {}) {
  switch (method) {
    // Older handshake, still what most shipping clients send.
    case "initialize":
      return {
        protocolVersion: params.protocolVersion && PROTOCOL_VERSIONS.includes(params.protocolVersion)
          ? params.protocolVersion
          : PROTOCOL_VERSIONS[0],
        capabilities: CAPABILITIES,
        serverInfo: SERVER_INFO,
        instructions:
          "Tools for the Opportunity -> outreach pack pipeline. fetch_posting pulls a live posting; " +
          "check_gpa_gate answers GPA minimums without exposing the GPA; log_run persists a run. " +
          "Read the knowledge files as resources before mapping evidence.",
      };

    // Spec revision 2026-07-28 discovery.
    case "server/discover":
      return {
        resultType: "complete",
        supportedVersions: PROTOCOL_VERSIONS,
        capabilities: CAPABILITIES,
        _meta: { "io.modelcontextprotocol/serverInfo": SERVER_INFO },
        ttlMs: 3_600_000,
        cacheScope: "public",
      };

    case "ping":
      return {};

    case "tools/list":
      return { resultType: "complete", tools: TOOLS };

    case "tools/call":
      return await callTool(params.name, params.arguments);

    case "resources/list":
      return { resultType: "complete", resources: await listResources() };

    case "resources/read":
      return await readResource(params.uri);

    case "prompts/list":
      return { resultType: "complete", prompts: PROMPTS };

    case "prompts/get": {
      const p = PROMPTS.find((x) => x.name === params.name);
      if (!p) throw new Error(`unknown prompt: ${params.name}`);
      return {
        description: p.description,
        messages: [
          {
            role: "user",
            content: { type: "text", text: PROMPT_TEXT[params.name](params.arguments ?? {}) },
          },
        ],
      };
    }

    default:
      return { __unknownMethod: true };
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
log(`ready — repo root ${REPO}`);

rl.on("line", async (line) => {
  const raw = line.trim();
  if (!raw) return;

  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    process.stdout.write(
      JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n"
    );
    return;
  }

  // Notifications carry no id and get no response.
  if (msg.id === undefined || msg.id === null) {
    log(`notification: ${msg.method}`);
    return;
  }

  try {
    const result = await handle(msg.method, msg.params);
    if (result && result.__unknownMethod) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32601, message: `Method not found: ${msg.method}` },
        }) + "\n"
      );
      return;
    }
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result }) + "\n");
  } catch (err) {
    log(`error in ${msg.method}: ${err.message}`);
    process.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: msg.id,
        result: { isError: true, content: [{ type: "text", text: `Error: ${err.message}` }] },
      }) + "\n"
    );
  }
});
