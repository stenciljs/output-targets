// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        wizard: 'src/wizard.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@stencil/core', 'node:path', 'node:fs/promises', 'ts-morph', 'nypm', '@clack/prompts'],
    },
  },
  plugins: [dts()],
});
