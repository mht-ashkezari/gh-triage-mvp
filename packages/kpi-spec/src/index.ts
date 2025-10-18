// packages/kpi-spec/src/index.ts

import { z } from "zod";

/**
 * Core KPI specification schema used for validation and code generation.
 * Each KPI has a key, title, description, and numeric thresholds.
 */
export const KpiSpec = z.object({
    meta: z.object({
        version: z.string().default("1.0"),
        generatedAt: z.string().datetime().optional()
    }).optional(),
    kpis: z.array(
        z.object({
            key: z.string().min(1),
            title: z.string(),
            description: z.string().optional(),
            target: z.number().nonnegative(),
            threshold: z.number().optional(),
            unit: z.string().optional(),
        })
    ),
});

export type KpiSpecType = z.infer<typeof KpiSpec>;
export default KpiSpec;
