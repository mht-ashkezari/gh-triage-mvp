#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const [, , group = "", cmd = "", ...rest] = process.argv;

function main() {
  if (group === "kpi" && cmd === "check") {
    const { main } = require("./commands/kpi-check");
    return main(rest);
  }
  if (group === "kpi" && cmd === "schema") {
    const { main } = require("./commands/kpi-schema");
    return main(rest);
  }
  console.error("Usage:\n  ghtriage kpi check\n  ghtriage kpi schema");
  process.exit(2);
}
main();
