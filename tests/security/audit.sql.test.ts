import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";

describe("security_audit_log schema", () => {
    it("creates table successfully", () => {
        const db = new Database(":memory:");
        const sql = fs.readFileSync("packages/schemas/sql/security_audit.sql", "utf8");
        db.exec(sql);
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        expect(tables.some(t => t.name === "security_audit_log")).toBe(true);
    });
});
