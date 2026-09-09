import { defineConfig } from 'vite';
import { stencilSSR } from '@stencil/ssr';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5002,
  },
  plugins: [
    react(),
    stencilSSR({
      module: import('component-library-react'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: {
        scoped: ['my-counter', 'my-button', 'my-component', 'my-radio'],
        default: 'declarative-shadow-dom',
      },
      setTagTransformer: (tag) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag,
    }),
  ],
})
