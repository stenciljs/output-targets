import url from 'node:url';
import path from 'node:path';

import type { NextConfig } from 'next';
import type { NextJsWebpackConfig, WebpackConfigContext } from 'next/dist/server/config-shared';

import type { StencilSSROptions } from './types.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

type StencilNextPlugin = (nextConfig: any) => NextConfig

export default (pluginOptions: StencilSSROptions): StencilNextPlugin => (nextConfig: NextConfig = {}) => {
  const webpack: NextJsWebpackConfig = (config: any, options: WebpackConfigContext) => {
    /**
     * This adds a side-effectful import for the Stencil runtime
     */
    const imports = [`side-effects ${'component-library/loader'}`];

    /**
     * adds our loader to the webpack config
     */
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      enforce: 'pre',
      use: [{
        loader: path.resolve(__dirname, 'next', 'loader.js'),
        options: pluginOptions
      }]
    });

    config.module.rules.unshift({
      test: /\/pages\/.*\.(?:j|t)sx?$|\/app\/.*\.(?:j|t)sx?$/,
      exclude: [/next\/dist\//, /node_modules/],
      loader: 'imports-loader',
      options: {
        imports,
      },
    });

    // Apply user provided custom webpack config function if it exists.
    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  }

  return Object.assign({}, nextConfig, { webpack });
};
