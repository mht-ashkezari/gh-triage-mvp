import { z } from "zod";

const SnapshotWindow = z.object({
    since: z.string().datetime(),
    until: z.string().datetime(),
});

const SnapshotRepo = z.object({
    owner: z.string().min(1),
    name: z.string().min(1),
    labels_target_per_class: z.number().int().positive().default(20),
    window: SnapshotWindow.optional(),
});

//  accept both "snapshot.manifest.v1" and "snapshot-manifest.v1"

const ManifestVersion = z.literal("snapshot.manifest.v1");

export const SnapshotManifestV1 = z.object({
    version: ManifestVersion,
    window: SnapshotWindow,
    repos: z.array(SnapshotRepo).min(1),
    //  accept string OR array of strings
    notes: z.union([z.string(), z.array(z.string())]).optional(),
});

export type TSnapshotManifestV1 = z.infer<typeof SnapshotManifestV1>;

export const StatsJson = z.object({
    repo: z.string(),
    window: SnapshotWindow,
    counts: z.object({
        issues: z.number().int(),
        pulls: z.number().int(),
        commits: z.number().int(),
        labels: z.number().int(),
        sample_issues: z.number().int(),
        sample_pulls: z.number().int(),
    }),
    generated_at: z.string().datetime(),
    acceptance: z.object({
        target_label_min: z.number().int().positive(),
        note: z.string()
    }).optional(),
});
export type TStatsJson = z.infer<typeof StatsJson>;