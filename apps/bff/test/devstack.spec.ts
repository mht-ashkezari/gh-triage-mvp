import { describe, it, expect } from 'vitest';
import { Client } from 'pg';
import Redis from 'ioredis';

const DEVSTACK = process.env.DEVSTACK === '1';
const maybe = DEVSTACK ? describe : describe.skip;

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

maybe('DEVSTACK sanity', () => {
    it(
        'connects to Postgres',
        async () => {
            const url =
                process.env.DATABASE_URL ??
                process.env.POSTGRES_URL ??
                'postgres://postgres:devpass@127.0.0.1:5432/triage';

            let lastErr: unknown;

            for (let i = 0; i < 10; i++) {
                const client = new Client({ connectionString: url }); // NEW client per attempt
                try {
                    await client.connect();
                    const res = await client.query('select 1 as ok');
                    expect(res.rows[0].ok).toBe(1);
                    return; // success
                } catch (e) {
                    lastErr = e;
                    await sleep(500);
                } finally {
                    try {
                        await client.end();
                    } catch {
                        // ignore close errors
                    }
                }
            }

            throw lastErr;
        },
        20_000
    );

    it(
        'pings Redis',
        async () => {
            const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
            const r = new Redis(url);
            expect(await r.ping()).toBe('PONG');
            r.disconnect();
        },
        10_000
    );
});
