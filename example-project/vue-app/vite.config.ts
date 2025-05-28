import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5005
  },
  plugins: [
    vue(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Enable polyfills for node modules
      include: ['stream'],
    })
  ],
  define: {
    // Polyfill for Node.js modules in browser
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['stream-browserify']
  },
  build: {
    rollupOptions: {
      external: [
        'vite-plugin-node-polyfills/shims/process'
      ]
    }
  }
})
