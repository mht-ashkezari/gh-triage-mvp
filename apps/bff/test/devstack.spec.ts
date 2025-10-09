import { describe, it, expect } from "vitest";
import { Client } from "pg";
import Redis from "ioredis";

describe("DEVSTACK sanity", () => {
    it("connects to Postgres", async () => {
        const c = new Client({ connectionString: process.env.DATABASE_URL });
        await c.connect();
        await c.query("select 1");
        await c.end();
        expect(true).toBe(true);
    });

    it("pings Redis", async () => {
        const r = new Redis(process.env.REDIS_URL!);
        expect(await r.ping()).toBe("PONG");
        await r.quit();
    });
});
