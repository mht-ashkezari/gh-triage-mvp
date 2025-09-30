
import { z } from 'zod';


/**
 * ISO 8601 date-time string validated and branded via Zod.
 *
 * Represents a string that has been validated with z.string().datetime() and given the nominal
 * brand "iso". Valid values are ISO 8601 date-time strings such as:
 *   - "2021-08-19T13:45:30Z"
 *   - "2021-08-19T13:45:30.123Z"
 *   - "2021-08-19T13:45:30+02:00"
 *
 * Runtime behavior:
 * - Rejects non-ISO or malformed date-time strings.
 * - Use IsoDate.parse(value) to throw on invalid input or IsoDate.safeParse(value) to inspect results.
 *
 * Type-level behavior:
 * - The branding produces a nominal/opaque type to distinguish validated ISO date strings from plain strings.
 *   This helps prevent accidental use of unvalidated strings in places that require ISO date-times.
 *
 * Examples:
 * - IsoDate.parse("2021-08-19T13:45:30Z") // -> validated branded string
 * - IsoDate.safeParse("not-a-date")      // -> validation error
 *
 * @remarks
 * Validation specifics (allowed precisions, offsets, etc.) follow Zod's datetime() implementation and
 * may vary between Zod versions. 
 */
export const IsoDate = z.string().datetime().brand<"iso">();

/**
 * CriticalFactsV1
 *
 * Represents a normalized set of "critical facts" extracted from a GitHub issue
 * that the triage system stores and reasons about.
 *
 * @property issue_id - The numeric, integer ID of the issue (e.g., GitHub issue number).
 * @property template - Optional classification template for the issue; one of:
 *                       "bug", "feature", "question", or "other".
 * @property has_repro - Optional boolean indicating whether a reproducible test case
 *                       or clear reproduction steps are present in the issue.
 * @property components - List of component names or tags associated with the issue.
 *                        Defaults to an empty array when none are provided.
 * @property body_sha - Hexadecimal SHA fingerprint (64 chars) of the issue body content
 *                      used to detect body changes or deduplicate content.
 * @property created_at - ISO-8601 formatted timestamp indicating when these critical facts
 *                        were recorded.
 *
 * Example:
 * {
 *   issue_id: 12345,
 *   template: "bug",
 *   has_repro: true,
 *   components: ["ui", "auth"],
 *   body_sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   created_at: "2024-01-15T12:34:56.000Z"
 * }
 */
export const CriticalFactsV1 = z.object({
    issue_id: z.number().int(),
    template: z.enum(["bug", "feature", "question", "other"]).optional(),
    has_repro: z.boolean().optional(),
    components: z.array(z.string()).default([]),
    body_sha: z.string().length(64),
    created_at: IsoDate,
});

const score = z.number().min(0).max(1);

/**
 * Zod schema for a suggested label with an associated confidence score.
 *
 * Represents a proposed label for an issue along with a numeric confidence value
 * produced by the triage system.
 *
 * @property name - The label name (for example, "bug", "feature", "docs"). Must be a string.
 * @property score - Confidence score in the inclusive range [0, 1], where 0 indicates no confidence
 *                   and 1 indicates highest confidence.
 *
 * @example
 * // { name: "bug", score: 0.87 }
 */
export const LabelScore = z.object({ name: z.string(), score });


/**
 * Zod schema for an assignee and their associated score.
 *
 * Validates objects that pair a GitHub user login with a numeric score used for triage/ranking.
 *
 * Properties:
 * - `login` — the user's GitHub login (string).
 * - `score` — the numeric score validator referenced by the `score` symbol in this module.
 *
 * @remarks
 * Use this schema to validate incoming data structures that represent an assignee and a computed
 * score. The concrete validation rules for `score` are defined by the `score` schema in the same module.
 *
 * @example
 * // Valid object shape:
 * // { login: "octocat", score: 42 }
 *
 * @see score
 */
export const AssigneeScore = z.object({ login: z.string(), score });


/**
 * Zod schema for a duplicate candidate.
 *
 * Represents a potential duplicate (for example, an issue or pull request)
 * with an identifier and a similarity/confidence score.
 *
 * Properties:
 * - number: integer identifier of the candidate (e.g., issue or PR number).
 * - score: numeric similarity or confidence score; higher values indicate
 *   a greater likelihood that this candidate is a duplicate.
 *
 * Remarks:
 * - The schema enforces that `number` is an integer.
 * - The exact constraints and range of `score` are determined by the
 *   `score` Zod schema used when composing this object.
 *
 * Example:
 * // { number: 42, score: 0.92 }
 */
export const DupCandidate = z.object({ number: z.number().int(), score });

/**
 * TriageCardV1
 *
 * Schema describing a single triage recommendation for a GitHub issue.
 *
 * Properties:
 * @property {number} issue_id - The numeric ID of the issue this card pertains to. Integer value.
 *
 * @property {object} suggestions - Suggested actions and metadata produced by the triage system.
 * @property {LabelScore[]} suggestions.labels - Ranked label suggestions. Defaults to an empty array.
 * @property {Score | undefined} suggestions.priority - Optional priority score/recommendation for the issue. May be omitted.
 * @property {AssigneeScore[]} suggestions.assignees - Suggested assignees with confidence scores. Defaults to an empty array.
 * @property {DupCandidate[]} suggestions.dup_candidates - Potential duplicate issue candidates. Defaults to an empty array.
 *
 * @property {string[]} rationale - Human- or machine-readable explanation strings that justify the suggestions. Defaults to an empty array.
 *
 * @property {string[]} evidence_ids - Identifiers referencing the pieces of evidence (e.g., embeddings, search hit ids) used to generate the suggestions. Defaults to an empty array.
 *
 * @remarks
 * - This is the v1 shape for triage cards returned by or stored in the system; consumers should treat arrays as empty when omitted and handle an absent `suggestions.priority` as "no priority suggested."
 * - Nested types referenced here (LabelScore, AssigneeScore, DupCandidate, Score) are expected to be defined elsewhere in the schema package.
 */
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

/**
 * Zod schema for a single release note entry.
 *
 * Represents an item included in a changelog or release summary.
 *
 * Properties:
 * - title: A short, human-readable title for the change. Max length 200 characters.
 * - link: A string containing a valid URL pointing to the related PR/issue/commit.
 * - group: A categorical tag indicating the type of change. Allowed values: "feature", "fix", "breaking", "docs", "chore".
 * - thanks_to: An optional array of contributor names (strings) to credit for the change.
 *
 * @remarks
 * Use this schema to validate objects that will be rendered in release notes or aggregated into release sections.
 *
 * @example
 * const example = {
 *   title: "Add user profile page",
 *   link: "https://github.com/org/repo/pull/123",
 *   group: "feature",
 *   thanks_to: ["alice", "bob"]
 * };
 */
export const ReleaseItem = z.object({
    title: z.string().max(200),
    link: z.string().url(),
    group: z.enum(["feature", "fix", "breaking", "docs", "chore"]),
    thanks_to: z.array(z.string()).optional()
});

/**
 * Zod schema for ReleaseNotesV1 — the canonical shape for a release notes document.
 *
 * - items: An ordered array of release note entries; each entry conforms to the ReleaseItem schema.
 * - citations: An array of strings, each validated as a URL; used to reference sources or external resources. Defaults to an empty array.
 *
 * This schema validates the top-level structure used when producing, consuming, or transferring release notes data.
 *
 * Properties
 * @property items - Required. Array of ReleaseItem objects describing individual release notes entries. See {@link ReleaseItem} for the item's structure.
 * @property citations - Optional. Array of strings validated as absolute URLs (via z.string().url()). If omitted, defaults to [].
 *
 * Example:
 * {
 *   items: [
 *     { <ReleaseItem fields...> }
 *   ],
 *   citations: ["https://example.com/source"]
 * }
 *
 * @remarks
 * - Each element in `citations` must be a valid URL string (e.g., "https://...").
 * - Use the ReleaseItem schema to determine required/optional fields for entries in `items`.
 *
 * @defaultValue citations []
 */
export const ReleaseNotesV1 = z.object({
    items: z.array(ReleaseItem),
    citations: z.array(z.string().url()).default([]),
});
