import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { stencilSSR } from "@stencil/ssr";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    stencilSSR({
      module: import('component-library-react/server'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: {
        'scoped': ['my-counter'],
        default: 'declarative-shadow-dom',
      },
    }),
  ],
});
