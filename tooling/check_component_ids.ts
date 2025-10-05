// tooling/check_component_ids.ts
import fs from "node:fs";
import path from "node:path";

const fail = (msg: string) => {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
};
const ok = (msg: string) => console.log(`✅ ${msg}`);

const idsPath = path.resolve("packages/shared/component-ids.json");
if (!fs.existsSync(idsPath)) {
  fail(`Missing ${idsPath}`);
  process.exit(1);
}
const ids = Object.values(JSON.parse(fs.readFileSync(idsPath, "utf8"))) as string[];

const releasesDir = path.resolve("docs/arch/releases");
if (!fs.existsSync(releasesDir)) {
  fail(`Missing ${releasesDir}`);
  process.exit(1);
}

const versions = fs
  .readdirSync(releasesDir)
  .filter((f) => f.startsWith("v") && fs.statSync(path.join(releasesDir, f)).isDirectory());

if (versions.length === 0) {
  console.warn(`⚠️  No version folders under ${releasesDir}`);
  process.exit(0);
}

const imgDir = path.resolve("docs/img");
const expectedSvgs = ["context.svg", "containers.svg", "sequence_a2e.svg", "deployment_k8s.svg"];

for (const v of versions) {
  // 1) containers.mmd must contain all component IDs
  const containers = path.join(releasesDir, v, "containers.mmd");
  if (!fs.existsSync(containers)) {
    console.warn(`⚠️  Missing ${v}/containers.mmd (skipped ID check)`);
  } else {
    const mmd = fs.readFileSync(containers, "utf8");
    for (const id of ids) {
      if (!mmd.includes(id)) {
        fail(`${id} missing in ${path.relative(process.cwd(), containers)}`);
      }
    }
    ok(`${v}/containers.mmd: component IDs present`);
  }

  // 2) rendered SVGs must exist and be non-empty
  const outDir = path.join(imgDir, v);
  if (!fs.existsSync(outDir)) {
    fail(`Rendered folder missing: ${outDir} (did you run pnpm diagrams:build?)`);
    continue;
  }
  for (const svg of expectedSvgs) {
    const p = path.join(outDir, svg);
    if (!fs.existsSync(p)) {
      fail(`Missing SVG: ${path.relative(process.cwd(), p)}`);
    } else if (fs.statSync(p).size === 0) {
      fail(`Empty SVG: ${path.relative(process.cwd(), p)}`);
    }
  }
  ok(`${v}: all SVGs present & non-empty`);
}

// 3) latest pointer check
const latest = path.join(imgDir, "latest");
if (!fs.existsSync(latest)) {
  fail(`Missing docs/img/latest (render script should populate it)`);
} else {
  for (const svg of expectedSvgs) {
    const p = path.join(latest, svg);
    if (!fs.existsSync(p)) fail(`Missing docs/img/latest/${svg}`);
  }
  ok("docs/img/latest populated");
}

process.exit(process.exitCode ?? 0);
