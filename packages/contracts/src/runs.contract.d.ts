import { z } from "zod";
/**
 * Long-running pipeline invocations.
 */
export declare const RunsContract: {
    runA: {
        method: "POST";
        body: z.ZodObject<{
            repo_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            repo_id: string;
        }, {
            repo_id: string;
        }>;
        path: "/runs/A";
        responses: {
            202: z.ZodObject<{
                run_id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                run_id: string;
            }, {
                run_id: string;
            }>;
        };
    };
    runD: {
        method: "POST";
        body: z.ZodObject<{
            repo_id: z.ZodString;
            tag: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            repo_id: string;
            tag?: string | undefined;
        }, {
            repo_id: string;
            tag?: string | undefined;
        }>;
        path: "/runs/D";
        responses: {
            202: z.ZodObject<{
                run_id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                run_id: string;
            }, {
                run_id: string;
            }>;
        };
    };
};
