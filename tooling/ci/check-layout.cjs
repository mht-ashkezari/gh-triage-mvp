// Enforce directory policy:
// - FAIL if any tracked files are located in a folder named "scripts"
// - FAIL if any tracked file contains a textual reference to "scripts/"
// - Allow untracked, local scratch folders named "scripts" to exist

const { execSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

function git(cmd) {
    return execSync(`git ${cmd}`, { encoding: "utf8" }).trim();
}

// 1) No tracked files inside any local scratch folder named scripts
const trackedInScripts = git('ls-files -- "scripts" "scripts/**"')
    .split("\n")
    .filter(Boolean);

if (trackedInScripts.length > 0) {
    console.error("❌ Tracked files detected inside a local scratch (scripts) folder:");
    trackedInScripts.forEach((p) => console.error("  - " + p));
    process.exit(2);
}

// 2) No textual references to "scripts/" in tracked text files (except this file)
const trackedAll = git("ls-files").split("\n").filter(Boolean);
const TEXT_EXT = /\.(md|txt|yml|yaml|json|js|cjs|mjs|ts|tsx|sh|bash|zsh|env|ini|toml)$/i;

const offenders = [];
for (const p of trackedAll) {
    if (p.endsWith("tooling/ci/check-layout.cjs")) continue; // ✅ ignore this script itself
    if (!TEXT_EXT.test(p)) continue;
    const content = readFileSync(p, "utf8");
    if (content.includes("/scripts/") || content.includes(" scripts/")) offenders.push(p);
}

if (offenders.length > 0) {
    console.error("❌ References to 'scripts/' found in tracked files (not allowed):");
    offenders.forEach((p) => console.error("  - " + p));
    process.exit(2);
}

console.log("✅ Layout OK: no tracked 'scripts/' dirs or references found.");
