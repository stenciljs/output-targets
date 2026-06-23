import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5005
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      stream: 'stream-browserify',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['stream-browserify']
  },
})
