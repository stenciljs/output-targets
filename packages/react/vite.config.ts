// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        runtime: 'src/runtime/index.ts',
        ssr: 'src/runtime/ssr.tsx',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['@stencil/core', '@lit/react', 'typescript', 'react', 'react-dom/server', 'ts-morph', 'html-react-parser', 'node:path'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'ts-morph': 'tsMorph',
        },
      },
    },
  },
  plugins: [dts()],
});
