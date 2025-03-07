// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        next: 'src/next.ts'
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'node:path', 'node:url', 'node:fs',
        '@stencil/core', '@lit/react', 'typescript', 'react', 'react-dom/server', 'ts-morph',
        'html-react-parser', 'mlly', 'esbuild', 'recast', 'ast-types',
      ]
    },
  },
});
