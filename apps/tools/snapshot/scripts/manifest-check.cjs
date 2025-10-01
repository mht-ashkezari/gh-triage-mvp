// CommonJS wrapper that dynamically imports the ESM schema package
const fs = require("fs");
const yaml = require("js-yaml");

(async () => {
    // Import from the package name (resolves via node_modules), not a relative path
    const { SnapshotManifestV1 } = await import("@ghtriage/schemas/datasets/snapshot");

    const doc = yaml.load(
        fs.readFileSync("../../datasets/snapshots/manifest.yaml", "utf8")
    );
    SnapshotManifestV1.parse(doc);
    console.log("manifest OK");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
