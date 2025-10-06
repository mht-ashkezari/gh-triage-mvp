// tooling/data/snapshot/manifest-check.cjs
// Validate datasets/snapshots/manifest.yaml against the built Zod schema (packages/schemas/dist)

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { pathToFileURL } = require("url");

(async () => {
    const ROOT = process.cwd(); //  invoked from repo root (CI and package.json scripts do this)
    const schemaJs = path.join(ROOT, "packages/schemas/dist/datasets/snapshot.js");

    if (!fs.existsSync(schemaJs)) {
        console.error(
            "Schema JS not found:", schemaJs, "\n" +
        "Run: pnpm -w --filter @ghtriage/schemas build"
        );
        process.exit(2);
    }

    const { SnapshotManifestV1 } = await import(pathToFileURL(schemaJs).href);

    const manifestPath = process.argv[2] || "datasets/snapshots/manifest.yaml";
    const raw = fs.readFileSync(manifestPath, "utf8");
    const doc = yaml.load(raw);

    SnapshotManifestV1.parse(doc);
    console.log("manifest OK");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
