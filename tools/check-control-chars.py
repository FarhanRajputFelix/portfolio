#!/usr/bin/env python3
"""
Fail if any source file contains a stray control character.

This exists because the same bug shipped four times, and every instance was
invisible in a diff, invisible in an editor, and invisible to grep:

  \\b   -> 0x08  in tools/fetch-jobs.py, 82 of them, twice over. Every regex
                 silently demanded a backspace character that no job title
                 contains, so all 900 listings classified as "other".
  \\n   -> 0x0A  in next-case-reminder.ics DESCRIPTION, 8 of them. A bare line
                 break inside a property value is invalid under RFC 5545.
  \\25  -> 0x15  in opportunities.html CSS `content`. Python read \\25 as an
                 octal escape. The browser drew a tofu box followed by the
                 literal text "B8", which is how it was finally spotted — from
                 a screenshot, days later.
  ESC  -> 0x1B  in agent/scout.mjs, embedded rather than escaped. Harmless at
                 runtime but the same root cause.

The cause each time was passing escape sequences through a bash heredoc, which
ate one backslash level. The lesson is written in the affected files: put the
script in a file and run it. This check is the backstop for when I forget.

  python tools/check-control-chars.py

Exits 1 if anything is found, so it can gate a commit or a workflow.
"""

import io
import os
import sys

ROOT = os.path.dirname(os.path.abspath(os.path.join(__file__, "..")))

# Tab, newline and carriage return are legitimate in text files. Nothing else
# below 0x20 has any business being in source.
LEGIT = {0x09, 0x0A, 0x0D}

EXTS = {".html", ".css", ".js", ".mjs", ".py", ".json", ".md",
        ".yml", ".yaml", ".tex", ".xml", ".srt", ".toml"}
SKIP_DIRS = {".git", "node_modules", "assets", "__pycache__"}

NAMES = {0x08: "backspace, probably a mangled \\b",
         0x0B: "vertical tab", 0x0C: "form feed",
         0x15: "NAK, probably a mangled \\25 read as octal",
         0x1B: "escape, probably a mangled \\x1b"}


def main() -> int:
    hits, scanned = [], 0

    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if os.path.splitext(name)[1].lower() not in EXTS:
                continue
            path = os.path.join(base, name)
            try:
                raw = io.open(path, "rb").read()
            except OSError:
                continue
            scanned += 1
            for i, byte in enumerate(raw):
                if byte < 0x20 and byte not in LEGIT:
                    rel = os.path.relpath(path, ROOT).replace("\\", "/")
                    line = raw[:i].count(b"\n") + 1
                    ctx = raw[max(0, i - 36):i + 12].decode("utf-8", "replace")
                    hits.append((rel, line, byte, ctx))

    print(f"scanned {scanned} text files")

    if not hits:
        print("no stray control characters")
        return 0

    print(f"\n{len(hits)} stray control byte(s) — each one is a mangled escape:\n")
    for rel, line, byte, ctx in hits:
        why = NAMES.get(byte, "unexpected control character")
        print(f"  {rel}:{line}  0x{byte:02X}  ({why})")
        print(f"    context: {ctx!r}")
    print("\nFix by writing the intended escape, and write the fix from a FILE,")
    print("not a bash heredoc — that is what produced every one of these.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
