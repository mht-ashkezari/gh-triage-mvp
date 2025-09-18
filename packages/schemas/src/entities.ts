import { z } from 'zod';

export const IsoDate = z.string().datetime().brand<"iso">();

export const CriticalFactsV1 = z.object({
    issue_id: z.number().int(),
    template: z.enum(["bug", "feature", "question", "other"]).optional(),
    has_repro: z.boolean().optional(),
    components: z.array(z.string()).default([]),
    body_sha: z.string().length(64),
    created_at: IsoDate,
});

const score = z.number().min(0).max(1);

export const LabelScore = z.object({ name: z.string(), score });
export const AssigneeScore = z.object({ login: z.string(), score });
export const DupCandidate = z.object({ number: z.number().int(), score });

export const TriageCardV1 = z.object({
    issue_id: z.number().int(),
    suggestions: z.object({
        labels: z.array(LabelScore).default([]),
        priority: score.optional(),
        assignees: z.array(AssigneeScore).default([]),
        dup_candidates: z.array(DupCandidate).default([]),
    }),
    rationale: z.array(z.string()).default([]),
    evidence_ids: z.array(z.string()).default([]),
});

export const ReleaseItem = z.object({
    title: z.string().max(200),
    link: z.string().url(),
    group: z.enum(["feature", "fix", "breaking", "docs", "chore"]),
    thanks_to: z.array(z.string()).optional()
});

export const ReleaseNotesV1 = z.object({
    items: z.array(ReleaseItem),
    citations: z.array(z.string().url()).default([]),
});
