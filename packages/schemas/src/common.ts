// packages/schemas/src/common.ts
import { z } from "zod";

export const PageQuery = z.object({
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(200).default(50),
});

export const Paginated = <T extends z.ZodTypeAny>(item: T) =>
    z.object({ items: z.array(item), next_cursor: z.string().nullable() });

export const ApiError = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
});

export const SchemaMeta = z.object({
    schema: z.literal("gh-triage"),
    version: z.string(), // semver
});

