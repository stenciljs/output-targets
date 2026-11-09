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
      // every Node built-in: a missing one is replaced with an empty object in the bundle
      external: ['@stencil/core', /^node:/, 'ts-morph'],
    },
  },
  plugins: [dts()],
});
