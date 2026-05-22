import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30 * 1000, // 30 seconds
  },
})