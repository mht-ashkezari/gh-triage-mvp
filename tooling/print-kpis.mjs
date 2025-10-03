#!/usr/bin/env node
import fs from "node:fs"; import YAML from "yaml";
const spec = YAML.parse(fs.readFileSync("docs/kpis.yaml", "utf8"));
const rows = spec.kpis.map(k => `| ${k.key} | ${k.target} | ${k.cadence} | ${k.description?.replace(/\|/g, '\\|') || ""} |`);
const md = `# KPIs\n\n| key | target | cadence | description |\n|---|---|---|---|\n${rows.join("\n")}\n`;
fs.writeFileSync("docs/kpis.md", md);
console.log("wrote docs/kpis.md");
