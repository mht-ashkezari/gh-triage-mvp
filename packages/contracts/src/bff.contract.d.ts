import { z } from "zod";
/**
 * BFF public API contract.
 */
export declare const BffContract: {
    health: {
        method: "GET";
        path: "/health";
        responses: {
            200: z.ZodObject<{
                ok: z.ZodLiteral<true>;
                svc: z.ZodLiteral<"bff">;
            }, "strip", z.ZodTypeAny, {
                ok: true;
                svc: "bff";
            }, {
                ok: true;
                svc: "bff";
            }>;
        };
    };
    getFacts: {
        pathParams: z.ZodObject<{
            id: z.ZodString;
            issue: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            issue: number;
        }, {
            id: string;
            issue: number;
        }>;
        method: "GET";
        path: "/repos/:id/facts/:issue";
        responses: {
            200: any;
        };
    };
    getTriage: {
        pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        method: "GET";
        path: "/repos/:id/triage";
        responses: {
            200: z.ZodArray<any, "many">;
        };
    };
    getReleaseDraft: {
        pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        method: "GET";
        path: "/repos/:id/release/draft";
        responses: {
            200: any;
        };
    };
};
