#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
    console.error("Usage: pnpm new:adr \"Short Title\"");
    process.exit(1);
}
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const dir = "docs/adrs";
fs.mkdirSync(dir, { recursive: true });
const seq = fs.readdirSync(dir).filter(f => /^\d{4}-/.test(f)).length + 1;
const id = String(seq).padStart(4, "0");
const file = path.join(dir, `${id}-${slug}.md`);
const today = new Date().toISOString().slice(0, 10);
const tpl = `# ADR ${id}: ${title}

- Status: Proposed
- Date: ${today}

## Context

## Decision

## Consequences

## Alternatives
`;
fs.writeFileSync(file, tpl);
console.log("Created", file);
