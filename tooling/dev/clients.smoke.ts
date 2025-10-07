import { makeBffClient, makeRunsClient } from "@ghtriage/clients";

async function main() {
    const baseUrl = process.env.BFF_URL ?? "http://localhost:3000";
    const bff = makeBffClient(baseUrl);
    const runs = makeRunsClient(baseUrl);

    console.log("bff.health type:", typeof bff.health);   // should be "function"
    console.log("runs.runA type:", typeof runs.runA);     // should be "function"

    // Optional, only if your BFF is actually running:
    // const res = await bff.health();
    // console.log("health status:", res.status, "body:", res.body);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});