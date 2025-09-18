import { z } from "zod";
export declare const PageQuery: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export declare const Paginated: <T extends z.ZodTypeAny>(item: T) => z.ZodObject<{
    items: z.ZodArray<T, "many">;
    next_cursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: T["_output"][];
    next_cursor: string | null;
}, {
    items: T["_input"][];
    next_cursor: string | null;
}>;
export declare const ApiError: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    details?: Record<string, any> | undefined;
}, {
    code: string;
    message: string;
    details?: Record<string, any> | undefined;
}>;
export declare const SchemaMeta: z.ZodObject<{
    schema: z.ZodLiteral<"gh-triage">;
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    schema: "gh-triage";
    version: string;
}, {
    schema: "gh-triage";
    version: string;
}>;
