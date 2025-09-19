import { z } from "zod";

const Target = z.string().regex(
  /^\s*(>=|<=|==|>|<)\s*\d+(\.\d+)?\s*$/,
  "target must look like '>= 0.98', '<= 120', '== 1.0', etc."
);

const OtelMetric = z.object({
  type: z.literal("otel_metric"),
  metric_name: z.string().min(1),
  labels: z.record(z.string()).optional()
});

const OtelTrace = z.object({
  type: z.literal("otel_trace"),
  span_name: z.string().min(1)
});

const SqlQuery = z.object({
  type: z.literal("sql_query"),
  connection: z.string().min(1),
  query: z.string().min(1)
});

const BlobDiff = z.object({
  type: z.literal("blob_diff"),
  bucket: z.string().min(1),
  path_pattern: z.string().min(1)
});

const Source = z.discriminatedUnion("type", [
  OtelMetric, OtelTrace, SqlQuery, BlobDiff
]);

const Alerting = z.object({
  warn_above: z.number().optional(),
  warn_below: z.number().optional()
}).refine(a => a.warn_above !== undefined || a.warn_below !== undefined, {
  message: "alerting must include warn_above or warn_below"
});

const Cadence = z.enum(["per_run", "daily", "weekly", "monthly"]);

const KpiItem = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, "use snake_case for KPI keys"),
  name: z.string().min(1),
  description: z.string().min(1),
  formula: z.string().min(1),
  target: Target,
  source: Source,
  cadence: Cadence,
  alerting: Alerting.optional()
});

export const KpiSpec = z.object({
  version: z.number().int().min(1),
  owner: z.string().min(1),
  kpis: z.array(KpiItem).min(1)
});

export type TKpiSpec = z.infer<typeof KpiSpec>;
