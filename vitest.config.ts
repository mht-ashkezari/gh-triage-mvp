import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],

    projects: [
      {
        test: {
          name: 'root',
          include: ['test/**/*.spec.ts'],
          setupFiles: ['./vitest.setup.ts'],
          environment: 'node',
        }
      },
      {
        test: {
          name: 'schemas',
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          include: ['packages/schemas/test/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'contracts',
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          include: ['packages/contracts/test/**/*.spec.ts'],
        },
      },
    ],
  },
});
