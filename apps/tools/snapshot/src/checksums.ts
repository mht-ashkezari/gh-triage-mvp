import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path";
export function sha256File(p: string) {
    const h = crypto.createHash("sha256"); h.update(fs.readFileSync(p)); return h.digest("hex");
}
export function writeSha256Sums(dir: string, files: string[]) {
    const lines = files.map(f => `${sha256File(path.join(dir, f))}  ${f}`).join("\n") + "\n";
    fs.writeFileSync(path.join(dir, "SHA256SUMS"), lines, "utf8");
}
