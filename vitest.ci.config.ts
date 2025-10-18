import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@ghtriage/schemas': r('./packages/schemas/src'),
            '@ghtriage/contracts': r('./packages/contracts/src'),
            '@ghtriage/clients': r('./packages/clients/src'),
        },
    },
    test: {
        // global coverage settings for CI
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],
            include: [
                'packages/schemas/src/**/*.{ts,js}',
                'packages/contracts/src/**/*.{ts,js}',
            ],
            exclude: [
                '**/*.spec.*',
                '**/test/**',
                '**/__tests__/**',
                '**/dist/**',
                '**/*.d.ts',
                'docs/**',
                'apps/**',
                'tooling/**',
                'vitest*.{js,ts}',
                '**/*.config.{js,ts,mjs,cjs}',
            ],
        },

        include: [],
        exclude: ['apps/**', '**/cypress/**'],

        projects: [
            {
                test: {
                    name: 'root',
                    include: ['tests/**/*.spec.ts'],
                    exclude: ['tests/selacc.webhook.e2e.spec.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                    environment: 'node',
                },
            },
            {
                test: {
                    name: 'schemas',
                    include: ['packages/schemas/test/**/*.spec.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                    environment: 'node',
                },
            },
            {
                test: {
                    name: 'contracts',
                    include: ['packages/contracts/test/**/*.spec.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                    environment: 'node',
                },
            },
        ],
    },
});
