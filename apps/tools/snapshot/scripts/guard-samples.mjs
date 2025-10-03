import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "datasets", "snapshots");
const MAX = Number(process.env.SAMPLE_MAX_LINES ?? 500);

function* walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) yield* walk(p);
        else yield p;
    }
}

function countLines(file) {
    const buf = fs.readFileSync(file, "utf8");
    // cheap count; fine for tiny files
    return (buf.match(/\n/g) || []).length;
}

let bad = 0;
for (const f of walk(DIR)) {
    if (!/\/sample\/.+\.jsonl$/.test(f)) continue;
    const n = countLines(f);
    if (n > MAX) {
        console.error(`Too big: ${path.relative(ROOT, f)} (${n} lines) > ${MAX}`);
        bad++;
    }
}

if (bad) process.exit(1);
console.log("Sample size check OK.");
