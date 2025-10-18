import { initClient } from "@ts-rest/core";
import { BffContract } from "@ghtriage/contracts/bff";

export const makeBffClient = (baseUrl: string, fetchImpl: typeof fetch = fetch) =>
    initClient(BffContract, { baseUrl, baseHeaders: {}, jsonQuery: true, fetch: fetchImpl });
