import fs from "node:fs";
import path from "node:path";

export function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

export class JSONLWriter {
    private stream: fs.WriteStream;
    private tmpPath: string;
    private finalPath: string;

    constructor(finalPath: string) {
        this.finalPath = finalPath;
        const dir = path.dirname(finalPath);
        ensureDir(dir);
        this.tmpPath = `${finalPath}.run-${Date.now()}.tmp`;
        this.stream = fs.createWriteStream(this.tmpPath, { flags: "w" });
    }

    write(row: unknown) {
        this.stream.write(JSON.stringify(row));
        this.stream.write("\n");
    }

    async commit() {
        await new Promise<void>((res, rej) => this.stream.end(err => (err ? rej(err) : res())));
        fs.renameSync(this.tmpPath, this.finalPath);
    }

    async abort() {
        try {
            await new Promise<void>((res, rej) => this.stream.end(err => (err ? rej(err) : res())));
        } catch { }
        try {
            fs.rmSync(this.tmpPath, { force: true });
        } catch { }
    }
}
