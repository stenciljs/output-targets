// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@stencil/core', 'node:path'],
    },
  },
  plugins: [dts()],
});
