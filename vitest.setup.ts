import 'reflect-metadata';
// vitest.setup.ts
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, 'infra/docker/.env'), override: true });
