// apps/tools/snapshot/scripts/manifest-check.cjs
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

(async () => {
    // Resolve repo-rooted path to the built schema file
    const here = __dirname; // .../apps/tools/snapshot/scripts
    const schemaJs = path.resolve(here, "../../../..", "packages/schemas/dist/datasets/snapshot.js");
    const { SnapshotManifestV1 } = await import(pathToFileURL(schemaJs).href);

    // Manifest path (default or CLI arg)
    const manifestPath = process.argv[2] || "datasets/snapshots/manifest.yaml";
    const raw = fs.readFileSync(manifestPath, "utf8");
    const doc = yaml.load(raw);

    SnapshotManifestV1.parse(doc);
    console.log("manifest OK");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

function pathToFileURL(p) {
    const { pathToFileURL: toURL } = require("url");
    return toURL(p);
}
