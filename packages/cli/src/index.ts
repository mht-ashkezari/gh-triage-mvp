#!/usr/bin/env node
const [, , group = "", cmd = "", ...rest] = process.argv;

async function main() {
  if (group === "repos" && cmd === "score") {
    const { main } = await import("./commands/repos-score");
    return main(rest);
  }
  if (group === "kpi" && cmd === "check") {
    const { main } = await import("./commands/kpi-check");
    return main(rest);
  }
  if (group === "kpi" && cmd === "schema") {
    const { main } = await import("./commands/kpi-schema");
    return main(rest);
  }
  console.error(
    "Usage:\n  ghtriage repos score [--file path]\n  ghtriage kpi check\n  ghtriage kpi schema"
  );
  process.exit(2);
}
main();
