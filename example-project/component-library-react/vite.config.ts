import path from 'node:path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

const appConfig = defineConfig({
  plugins: [react()],
});

const name = 'component-library-react';
const packageConfig = defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    lib: {
      entry: path.resolve(__dirname, 'src/components.ts'),
      name,
      formats: ['es'],
      fileName: (format) => `${name}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'stream', 'node:path', 'node:url'],
    },
  },
  plugins: [dts()],
  resolve: {
    alias: {
      'component-library/hydrate': path.resolve(__dirname, '..', 'component-library', 'hydrate', 'index.mjs'),
    },
  },
});

// https://vitejs.dev/config/
export default process.env.TARGET === 'app' ? appConfig : packageConfig;
