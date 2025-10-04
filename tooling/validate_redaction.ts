import * as fs from "node:fs";
import * as fg from "fast-glob";

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const TOKEN = /(gh[pous]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})/;

let found = 0;

const targets = fg.sync(["datasets/snapshots/**/*.jsonl", "*.jsonl"]);

for (const file of targets) {
    const data = fs.readFileSync(file, "utf8");
    if (EMAIL.test(data) || TOKEN.test(data)) {
        console.error(`❌  PII detected in ${file}`);
        found++;
    }
}

if (found > 0) {
    console.error(`Found ${found} files containing PII.`);
    process.exit(1);
}

console.log("✅  All snapshots PII-free");
process.exit(0);
