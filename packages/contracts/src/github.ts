import { z } from "zod";
import { initContract } from "@ts-rest/core";

const c = initContract();

export const Installation = z.object({
    installation_id: z.number().int(),
    account_login: z.string(),
    account_type: z.string(),
    suspended: z.boolean(),
});

export const Repo = z.object({
    installation_id: z.number().int(),
    owner: z.string(),
    name: z.string(),
    private: z.boolean(),
});

export const GithubApi = c.router({
    listInstallations: {
        method: "GET",
        path: `/github/installations`,
        responses: { 200: z.array(Installation) },
        summary: "List known installations",
    },
    listRepos: {
        method: "GET",
        path: `/github/installations/:installationId/repos`,
        pathParams: z.object({ installationId: z.string() }),
        responses: { 200: z.array(Repo) },
        summary: "List repos for an installation",
    },
    // Webhook acknowledged - body shape varies; we respond {ok:true}
    webhookAck: {
        method: "POST",
        path: `/webhooks/github`,
        body: z.any(),
        responses: { 200: z.object({ ok: z.literal(true) }) },
        summary: "GitHub webhook receiver (HMAC verified)",
    },
});
export type GithubApi = typeof GithubApi;
