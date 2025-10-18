import { initClient } from "@ts-rest/core";
import { RunsContract } from "@ghtriage/contracts/runs";

export const makeRunsClient = (baseUrl: string, fetchImpl: typeof fetch = fetch) =>
    initClient(RunsContract, { baseUrl, baseHeaders: {}, jsonQuery: true, fetch: fetchImpl });
