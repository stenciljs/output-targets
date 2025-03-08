// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
export default defineConfig({
  build: {
    lib: {
      entry: {
        vite: 'src/vite/index.ts',
        next: 'src/next/index.ts',
        webpack: 'src/webpack/index.ts',
        loader: 'src/webpack/loader.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'node:path', 'node:url', 'node:fs', 'webpack', 'next', 'vite',
        '@stencil/core', '@lit/react', 'typescript', 'react', 'react-dom/server', 'ts-morph',
        'html-react-parser', 'mlly', 'esbuild', 'recast', 'ast-types',
      ]
    },
  },
  plugins: [dts()]
});
