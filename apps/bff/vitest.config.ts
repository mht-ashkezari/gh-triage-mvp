import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: ['test/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['**/*.spec.ts', '**/dist/**'],
            reporter: ['text', 'html', 'lcov'],
        },
    },
});
