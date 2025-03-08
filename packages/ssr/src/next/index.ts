import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';
import type { NextJsWebpackConfig, WebpackConfigContext } from 'next/dist/server/config-shared';

import { StencilSSRWebpackPlugin, MinimalWebpackConfig } from '../webpack/index.js';
import type { StencilSSROptions } from '../types.js';

type StencilNextPlugin = (nextConfig: any) => NextConfig;

export default (pluginOptions: StencilSSROptions): StencilNextPlugin => (nextConfig: NextConfig = {}) => {
  const stencilSSRWebpackPlugin = new StencilSSRWebpackPlugin({
    ...pluginOptions,
    include: /\/pages\/.*\.(?:j|t)sx?$|\/app\/.*\.(?:j|t)sx?$/,
    exclude: [/next\/dist\//, /node_modules/]
  });

  const webpack: NextJsWebpackConfig = (config: Configuration, options: WebpackConfigContext) => {
    if (!config.module) {
      config.module = {}
    }

    if (!config.module.rules) {
      config.module.rules = []
    }

    stencilSSRWebpackPlugin.apply({ options: config as MinimalWebpackConfig['options'] });

    // Apply user provided custom webpack config function if it exists.
    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  };

  return Object.assign({}, nextConfig, { webpack });
};

export * from '../types.js';
