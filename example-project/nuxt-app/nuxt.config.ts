// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  vite: {
    resolve: {
      alias: {
        // Alias the hydrate module to prevent importing Node.js dependencies in the browser
        // This module is only needed for SSR, so we exclude it from client builds
        'component-library/hydrate': '/dev/null'
      }
    },
    optimizeDeps: {
      exclude: [
        // Exclude the hydrate module from pre-bundling
        'component-library/hydrate'
      ]
    }
  }
})
