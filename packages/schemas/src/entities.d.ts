import { z } from 'zod';
export declare const IsoDate: z.ZodBranded<z.ZodString, "iso">;
export declare const CriticalFactsV1: z.ZodObject<{
    issue_id: z.ZodNumber;
    template: z.ZodOptional<z.ZodEnum<["bug", "feature", "question", "other"]>>;
    has_repro: z.ZodOptional<z.ZodBoolean>;
    components: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    body_sha: z.ZodString;
    created_at: z.ZodBranded<z.ZodString, "iso">;
}, "strip", z.ZodTypeAny, {
    issue_id: number;
    components: string[];
    body_sha: string;
    created_at: string & z.BRAND<"iso">;
    template?: "bug" | "feature" | "question" | "other" | undefined;
    has_repro?: boolean | undefined;
}, {
    issue_id: number;
    body_sha: string;
    created_at: string;
    template?: "bug" | "feature" | "question" | "other" | undefined;
    has_repro?: boolean | undefined;
    components?: string[] | undefined;
}>;
export declare const LabelScore: z.ZodObject<{
    name: z.ZodString;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    score: number;
}, {
    name: string;
    score: number;
}>;
export declare const AssigneeScore: z.ZodObject<{
    login: z.ZodString;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    score: number;
    login: string;
}, {
    score: number;
    login: string;
}>;
export declare const DupCandidate: z.ZodObject<{
    number: z.ZodNumber;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    number: number;
    score: number;
}, {
    number: number;
    score: number;
}>;
export declare const TriageCardV1: z.ZodObject<{
    issue_id: z.ZodNumber;
    suggestions: z.ZodObject<{
        labels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            score: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            score: number;
        }, {
            name: string;
            score: number;
        }>, "many">>;
        priority: z.ZodOptional<z.ZodNumber>;
        assignees: z.ZodDefault<z.ZodArray<z.ZodObject<{
            login: z.ZodString;
            score: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            score: number;
            login: string;
        }, {
            score: number;
            login: string;
        }>, "many">>;
        dup_candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            score: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            number: number;
            score: number;
        }, {
            number: number;
            score: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        labels: {
            name: string;
            score: number;
        }[];
        assignees: {
            score: number;
            login: string;
        }[];
        dup_candidates: {
            number: number;
            score: number;
        }[];
        priority?: number | undefined;
    }, {
        labels?: {
            name: string;
            score: number;
        }[] | undefined;
        priority?: number | undefined;
        assignees?: {
            score: number;
            login: string;
        }[] | undefined;
        dup_candidates?: {
            number: number;
            score: number;
        }[] | undefined;
    }>;
    rationale: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidence_ids: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    issue_id: number;
    suggestions: {
        labels: {
            name: string;
            score: number;
        }[];
        assignees: {
            score: number;
            login: string;
        }[];
        dup_candidates: {
            number: number;
            score: number;
        }[];
        priority?: number | undefined;
    };
    rationale: string[];
    evidence_ids: string[];
}, {
    issue_id: number;
    suggestions: {
        labels?: {
            name: string;
            score: number;
        }[] | undefined;
        priority?: number | undefined;
        assignees?: {
            score: number;
            login: string;
        }[] | undefined;
        dup_candidates?: {
            number: number;
            score: number;
        }[] | undefined;
    };
    rationale?: string[] | undefined;
    evidence_ids?: string[] | undefined;
}>;
export declare const ReleaseItem: z.ZodObject<{
    title: z.ZodString;
    link: z.ZodString;
    group: z.ZodEnum<["feature", "fix", "breaking", "docs", "chore"]>;
    thanks_to: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    link: string;
    group: "feature" | "fix" | "breaking" | "docs" | "chore";
    thanks_to?: string[] | undefined;
}, {
    title: string;
    link: string;
    group: "feature" | "fix" | "breaking" | "docs" | "chore";
    thanks_to?: string[] | undefined;
}>;
export declare const ReleaseNotesV1: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        link: z.ZodString;
        group: z.ZodEnum<["feature", "fix", "breaking", "docs", "chore"]>;
        thanks_to: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        link: string;
        group: "feature" | "fix" | "breaking" | "docs" | "chore";
        thanks_to?: string[] | undefined;
    }, {
        title: string;
        link: string;
        group: "feature" | "fix" | "breaking" | "docs" | "chore";
        thanks_to?: string[] | undefined;
    }>, "many">;
    citations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    items: {
        title: string;
        link: string;
        group: "feature" | "fix" | "breaking" | "docs" | "chore";
        thanks_to?: string[] | undefined;
    }[];
    citations: string[];
}, {
    items: {
        title: string;
        link: string;
        group: "feature" | "fix" | "breaking" | "docs" | "chore";
        thanks_to?: string[] | undefined;
    }[];
    citations?: string[] | undefined;
}>;
