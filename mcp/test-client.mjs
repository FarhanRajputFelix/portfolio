#!/usr/bin/env node
/**
 * A minimal MCP client — spawns outreach-server.mjs over stdio and drives it
 * with real JSON-RPC 2.0. This is the evidence harness for FL-05: it proves the
 * server answers the protocol, and it runs the three tasks chat alone could not do.
 *
 *   node mcp/test-client.mjs            # full transcript to stdout
 *   node mcp/test-client.mjs > log.txt  # capture it
 */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const HERE = dirname(fileURLToPath(import.meta.url));
const server = spawn(process.execPath, [join(HERE, "outreach-server.mjs")], {
  stdio: ["pipe", "pipe", "pipe"],
});

server.stderr.on("data", (d) => process.stdout.write(`\x1b[90m${d}\x1b[0m`));

const rl = createInterface({ input: server.stdout, crlfDelay: Infinity });
const pending = new Map();
let nextId = 1;

rl.on("line", (line) => {
  if (!line.trim()) return;
  const msg = JSON.parse(line);
  const resolve = pending.get(msg.id);
  if (resolve) {
    pending.delete(msg.id);
    resolve(msg);
  }
});

const META = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientInfo": { name: "fl05-test-client", version: "1.0.0" },
  "io.modelcontextprotocol/clientCapabilities": {},
};

function rpc(method, params = {}) {
  const id = nextId++;
  const req = { jsonrpc: "2.0", id, method, params: { ...params, _meta: META } };
  process.stdout.write(`\n\x1b[36m→ REQUEST\x1b[0m  ${JSON.stringify(req)}\n`);
  return new Promise((resolve) => {
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify(req) + "\n");
  });
}

function show(label, msg, { full = false } = {}) {
  const s = JSON.stringify(msg.result ?? msg.error, null, 2);
  const body = full || s.length < 1800 ? s : s.slice(0, 1800) + "\n  … [truncated for the transcript]";
  process.stdout.write(`\x1b[32m← ${label}\x1b[0m\n${body}\n`);
}

const rule = (t) =>
  process.stdout.write(`\n\x1b[1m${"═".repeat(74)}\n${t}\n${"═".repeat(74)}\x1b[0m\n`);

try {
  /* ---------------------------------------------------------------- */
  rule("HANDSHAKE — capability negotiation");
  show("initialize", await rpc("initialize", { protocolVersion: "2026-07-28", capabilities: {} }));
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  show("server/discover", await rpc("server/discover"));

  /* ---------------------------------------------------------------- */
  rule("DISCOVERY — all three primitives");
  const tools = await rpc("tools/list");
  process.stdout.write(
    `\x1b[32m← tools/list\x1b[0m — ${tools.result.tools.length} tools:\n` +
      tools.result.tools.map((t) => `    • ${t.name} — ${t.title}`).join("\n") +
      "\n"
  );
  const res = await rpc("resources/list");
  process.stdout.write(
    `\x1b[32m← resources/list\x1b[0m — ${res.result.resources.length} resources:\n` +
      res.result.resources.map((r) => `    • ${r.uri}`).join("\n") +
      "\n"
  );
  const prompts = await rpc("prompts/list");
  process.stdout.write(
    `\x1b[32m← prompts/list\x1b[0m — ${prompts.result.prompts.length} prompts:\n` +
      prompts.result.prompts.map((p) => `    • ${p.name} — ${p.title}`).join("\n") +
      "\n"
  );

  /* ---------------------------------------------------------------- */
  rule("TASK 1 — fetch a live posting from the web  (needs network I/O)");
  show(
    "tools/call fetch_posting",
    await rpc("tools/call", {
      name: "fetch_posting",
      arguments: { url: "https://sparai.org/", max_chars: 1200 },
    }),
    { full: true }
  );

  /* ---------------------------------------------------------------- */
  rule("TASK 2 — evaluate a GPA gate from a gitignored private file");
  show(
    "tools/call check_gpa_gate  (KAUST VSRP, 3.5/4)",
    await rpc("tools/call", {
      name: "check_gpa_gate",
      arguments: { threshold: 3.5, scale: 4.0, programme: "KAUST VSRP" },
    }),
    { full: true }
  );
  show(
    "tools/call check_gpa_gate  (a 2.5/4 programme, for contrast)",
    await rpc("tools/call", {
      name: "check_gpa_gate",
      arguments: { threshold: 2.5, scale: 4.0, programme: "Hypothetical 2.5 minimum" },
    }),
    { full: true }
  );

  /* ---------------------------------------------------------------- */
  rule("TASK 3 — persist a run to disk  (survives the session)");
  show(
    "tools/call log_run",
    await rpc("tools/call", {
      name: "log_run",
      arguments: {
        programme: "KAUST VSRP",
        fit_score: "4/10",
        call: "skip",
        verify_by_hand: "none — the GPA gate settled it",
        source_url: "https://admissions.kaust.edu.sa/study/internships",
      },
    }),
    { full: true }
  );

  /* ---------------------------------------------------------------- */
  rule("RESOURCE READ — application-controlled context");
  const r = await rpc("resources/read", { uri: "outreach://knowledge/cv-facts" });
  const text = r.result.contents[0].text;
  process.stdout.write(
    `\x1b[32m← resources/read outreach://knowledge/cv-facts\x1b[0m\n` +
      `    mimeType: ${r.result.contents[0].mimeType}\n` +
      `    chars: ${text.length}\n    first line: ${text.split("\n")[0]}\n`
  );

  rule("PROMPT GET — user-controlled template");
  const p = await rpc("prompts/get", {
    name: "step1_gather",
    arguments: { posting: "(posting text would be injected here)" },
  });
  process.stdout.write(
    `\x1b[32m← prompts/get step1_gather\x1b[0m\n` +
      p.result.messages[0].content.text.split("\n").map((l) => `    ${l}`).join("\n") +
      "\n"
  );

  rule("ERROR HANDLING — unknown method returns -32601, not a crash");
  show("bogus/method", await rpc("bogus/method"));

  process.stdout.write("\n\x1b[1m✓ all checks completed\x1b[0m\n");
} finally {
  server.stdin.end();
  server.kill();
}
