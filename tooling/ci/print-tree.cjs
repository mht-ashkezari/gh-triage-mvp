// Print top-two-levels of the repo (skip heavy dirs) to aid PR review
const { readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const skip = new Set([".git", "node_modules", ".turbo", "dist", ".venv", "scripts"]);

function list(dir, depth = 0) {
    const prefix = "  ".repeat(depth);
    for (const name of readdirSync(dir)) {
        if (skip.has(name)) continue;
        const full = join(dir, name);
        const st = statSync(full);
        console.log(`${prefix}${st.isDirectory() ? "📁" : "📄"} ${name}`);
        if (st.isDirectory() && depth < 1) list(full, depth + 1);
    }
}

list(root, 0);
