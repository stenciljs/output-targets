import { defineConfig } from 'vite';
import { stencilSSR } from '@stencil/ssr';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    stencilSSR({
      module: import('component-library-react'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: {
        'scoped': ['my-counter'],
        default: 'declarative-shadow-dom',
      },
    }),
  ],
})
