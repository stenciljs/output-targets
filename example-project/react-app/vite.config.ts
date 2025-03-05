import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const appConfig = defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'dist'),
  },
  plugins: [react()],
});
// https://vitejs.dev/config/
export default appConfig;
