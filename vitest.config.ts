import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'], // ensure reflect-metadata is loaded
  },
  esbuild: {
    // Force esbuild (used by Vitest/Vite) to enable TS decorators
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2022',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
});
