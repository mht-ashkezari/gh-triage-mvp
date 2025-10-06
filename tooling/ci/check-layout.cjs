// Enforce directory policy without blocking local convenience:
// - FAIL if any *tracked* files are under scripts/**
// - FAIL if any *tracked* file references "/scripts/" in its contents
// - Allow local, untracked scripts/** to exist

const { execSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

function git(cmd) {
    return execSync(`git ${cmd}`, { encoding: "utf8" }).trim();
}

// 1) No tracked files under scripts/**
const trackedInScripts = git('ls-files -- "scripts" "scripts/**"')
    .split("\n")
    .filter(Boolean);
if (trackedInScripts.length > 0) {
    console.error("Tracked files detected under /scripts/** (not allowed):");
    trackedInScripts.forEach((p) => console.error("  - " + p));
    process.exit(2);
}

// 2) No references to "/scripts/" in tracked text files
const trackedAll = git("ls-files").split("\n").filter(Boolean);
const TEXT_EXT = /\.(md|txt|yml|yaml|json|js|cjs|mjs|ts|tsx|sh|bash|zsh|env|ini|toml)$/i;

const offenders = [];
for (const p of trackedAll) {
    if (!TEXT_EXT.test(p)) continue;
    const content = readFileSync(p, "utf8");
    if (content.includes("/scripts/") || content.includes(" scripts/")) offenders.push(p);
}

if (offenders.length > 0) {
    console.error("References to '/scripts/' found in tracked files (not allowed):");
    offenders.forEach((p) => console.error("  - " + p));
    process.exit(2);
}

console.log("Layout OK: no tracked /scripts/** and no references to /scripts/.");
