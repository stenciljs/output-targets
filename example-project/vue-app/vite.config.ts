import { createRequire } from 'module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)

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
      stream: require.resolve('stream-browserify'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['stream-browserify']
  },
})
