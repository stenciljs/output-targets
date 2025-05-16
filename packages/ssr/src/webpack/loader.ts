import type { LoaderContext } from 'webpack';

import { transform } from '../transform.js';
import type { StencilSSROptions } from '../types.js';

export default async function stencilLoader(this: LoaderContext<StencilSSROptions>, source: string) {
  const options = this.getOptions();
  if (!source.includes(options.from)) {
    return source;
  }

  try {
    return await transform(
      source,
      this.resourcePath,
      options
    );
  } catch (error) {
    console.error(`[Stencil SSR] Error transforming ${this.resourcePath}:`, (error as Error).message);
    return source;
  }
}
