import type { Plugin } from 'vite';

import { transform } from '../transform.js';
import type { StencilSSROptions } from '../types.js';

type StencilSSRViteOptions = Omit<StencilSSROptions, 'strategy'>

export function stencilSSR(pluginOptions: StencilSSRViteOptions) {
  return {
    name: 'stencil:vite:ssr',
    transform: async function (this: any, code: string, id: string, options?: { ssr?: boolean }) {
      /**
       * only run in SSR mode
       */
      if (!options?.ssr) {
        return;
      }

      /**
       * transform Stencil component imports into wrapped serialized components
       */
      const transformedCode = await transform(
        code,
        id,
        pluginOptions
      );

      /**
       * if no components were imported, return the original code
       */
      return transformedCode || code;
    },
  } satisfies Plugin;
}
