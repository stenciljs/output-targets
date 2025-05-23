import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5005
  },
  plugins: [vue()],
  resolve: {
    alias: {
      // Alias the hydrate module to prevent importing Node.js dependencies in the browser
      // This module is only needed for SSR, so we provide an empty module for client builds
      'component-library/hydrate': new URL('./empty-hydrate-module.js', import.meta.url).pathname
    }
  },
  optimizeDeps: {
    exclude: [
      // Exclude the hydrate module from pre-bundling
      'component-library/hydrate'
    ]
  }
})
