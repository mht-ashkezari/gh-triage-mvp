import { z } from "zod";

/**
 * Page query parameters for cursor-based pagination.
 *
 * This Zod schema validates request query parameters used by listing endpoints
 * that support cursor-based pagination.
 *
 * Fields:
 * - cursor?: string — an opaque token returned by the API to fetch the next page.
 * - limit: number — integer between 1 and 200 (inclusive). Defaults to 50.
 *
 * Validation behavior:
 * - Ensures `limit` is an integer within the range [1, 200].
 * - Provides a default of 50 when `limit` is not supplied.
 * - By default Zod strips unknown object keys. To reject extras use `.strict()`.
 *   To keep unknown keys, use `.passthrough()`.
 *
 * Usage:
 * Validate incoming HTTP query parameters:
 *   const q = PageQuery.parse(req.query);
 * Use `q.cursor` when querying your datastore (for example, decoding the cursor
 * and applying it in a WHERE clause or using it to seek the next set of rows).
 *
 * Examples:
 * @example
 * const q = PageQuery.parse({ cursor: 'abc123', limit: 100 });
 * // q.cursor -> 'abc123'
 * // q.limit  -> 100
 *
 * @example
 * // default limit when omitted
 * const q2 = PageQuery.parse({});
 * // q2.cursor -> undefined
 * // q2.limit  -> 50
 *
 * @example
 * // invalid limit (throws ZodError)
 * PageQuery.parse({ limit: 0 });
 *
 * @remarks
 * - Unknown keys are stripped by default (Zod). To reject extras use `.strict()`;
 *   to preserve them use `.passthrough()`.
 * - `cursor` is optional for first-page requests.
 * - Keep cursors opaque to clients; sign and/or encrypt if they encode sensitive state.
 * - Common pattern: decode server-side and apply to SQL/ORM queries (e.g., WHERE id >
 *   decodeCursor(cursor) or using a created_at threshold).
 */
export const PageQuery = z.object({
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(200).default(50),
});

/**

/**
 * Generic paginated response schema factory.
 *
 * Produces a Zod schema for paginated API responses built from an item schema.
 *
 * Fields:
 * - items: T[] — array of items validated against the provided item schema.
 * - next_cursor: string | null — opaque token pointing to the next page. `null`
 *   indicates there are no more pages.
 *
 * Validation behavior:
 * - Each element of `items` is validated by the given item schema `T`.
 * - `next_cursor` may be `null` or a string; prefer `null` over empty string for
 *   terminal pages.
 *
 * Usage:
 * - Create schema: `const UserPage = Paginated(UserSchema);`
 * - Validate responses: `UserPage.parse(respBody)`
 *
 * Examples:
 * @example
 * const UserPage = Paginated(UserSchema);
 * UserPage.parse({ items: [{ id: 1, name: 'A' }], next_cursor: null });
 *
 * @example
 * // invalid item shape (throws ZodError)
 * UserPage.parse({ items: [{ id: 'x' }], next_cursor: null });
 *
 * @typeParam T - a Zod schema type describing a single item (e.g., `UserSchema`).
 * @param item - Zod schema for the item to validate in the `items` array.
 * @returns A Zod schema validating `{ items: T[], next_cursor: string | null }`.
 *
 * @remarks
 * Ensure your server's `next_cursor` encoding/decoding logic is compatible with
 * `PageQuery` decoding. If using a signed cursor, confirm expiration and signing
 * verification are performed server-side before using the cursor to fetch data.
 */
export const Paginated = <T extends z.ZodTypeAny>(item: T) =>
    z.object({ items: z.array(item), next_cursor: z.string().nullable() });

/**

Standard API error payload schema.
Models error responses returned by the API to clients and for internal logs.
Fields:
code: string — machine-readable error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR').
message: string — human-readable explanation suitable for logs or safe display.
details?: Record<string, any> — optional metadata for debugging (avoid sensitive data).
Validation behavior:
code and message are required strings.
details is permissive (z.record(z.any())) to allow structured debug info.
Usage:
Validate outbound errors: ApiError.parse(errorPayload)
Map internal exceptions to this shape before sending to clients.
Examples:
@example
const err = { code: 'NOT_FOUND', message: 'Item not found', details: { id: 123 } };
ApiError.parse(err);
@example
// missing message (throws ZodError)
ApiError.parse({ code: 'SERVER_ERROR' });
@remarks
Keep details free of secrets (tokens, passwords). Sanitize validation errors
and sensitive fields before including in details. */
export const ApiError = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
});


/**

Schema metadata for artifacts and payload versioning.
Describes the schema family and version for exported fixtures, snapshots, or
payload headers to allow consumers to verify compatibility.
Fields:
schema: 'gh-triage' — literal identifying the schema family.
version: string — semantic version (semver) indicating the schema version.
Validation behavior:
schema must strictly equal 'gh-triage'.
version is a string; prefer semver format (MAJOR.MINOR.PATCH).
Usage:
Embed in exported data or API payloads to signal compatibility:
SchemaMeta.parse({ schema: 'gh-triage', version: '1.0.0' })
Examples:
@example
SchemaMeta.parse({ schema: 'gh-triage', version: '1.0.0' });
@remarks
Bump MAJOR for breaking changes, MINOR for additive changes, PATCH for fixes.
Consumers should check schema + version and gracefully reject incompatible versions. */
export const SchemaMeta = z.object({
    schema: z.literal("gh-triage"),
    version: z.string(), // semver
});

