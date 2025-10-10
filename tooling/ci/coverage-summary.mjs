import fs from 'node:fs';
import path from 'node:path';

function candidatesFor(dir) {
    return [
        path.join(dir, 'coverage', 'coverage-summary.json'),
        path.join(dir, 'coverage', 'coverage-final.json'),
    ];
}

function globSummaries(rootCwd) {
    const files = [];
    const pushExisting = p => { if (fs.existsSync(p)) files.push(p); };

    // root
    for (const p of candidatesFor(rootCwd)) pushExisting(p);

    // workspaces
    for (const scope of ['packages', 'apps']) {
        try {
            const entries = fs.readdirSync(scope, { withFileTypes: true })
                .filter(e => e.isDirectory());
            for (const e of entries) {
                for (const p of candidatesFor(path.join(scope, e.name))) pushExisting(p);
            }
        } catch { /* ignore */ }
    }
    return files;
}

function add(acc, part) {
    for (const k of ['lines', 'statements', 'branches', 'functions']) {
        const a = acc[k] ?? (acc[k] = { total: 0, covered: 0 });
        const p = part[k];
        if (!p) continue;
        a.total += Number(p.total || 0);
        a.covered += Number(p.covered || 0);
    }
    return acc;
}

const summaries = globSummaries(process.cwd());
if (!summaries.length) {
    console.log('### Coverage\nNo coverage summary found.');
    process.exit(0);
}

let merged = {};
let seenAny = false;

for (const file of summaries) {
    try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
        // coverage-final.json has shape { total: {...} }, summary is already { total: {...} }
        const t = raw.total || raw;
        if (t && Object.keys(t).length) {
            merged = add(merged, t);
            seenAny = true;
        }
    } catch { /* ignore */ }
}

if (!seenAny) {
    console.log('### Coverage\nNo coverage data in summaries.');
    process.exit(0);
}

const pct = (c, t) => (t ? Math.round((c / t) * 10000) / 100 : 0);
const L = pct(merged.lines.covered, merged.lines.total);
const S = pct(merged.statements.covered, merged.statements.total);
const B = pct(merged.branches.covered, merged.branches.total);
const F = pct(merged.functions.covered, merged.functions.total);

console.log('### Coverage');
console.log(`- **Statements:** ${S}%`);
console.log(`- **Branches:** ${B}%`);
console.log(`- **Functions:** ${F}%`);
console.log(`- **Lines:** ${L}%`);
