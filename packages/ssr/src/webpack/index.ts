import path from 'node:path';
import url from 'node:url';

import type { RuleSetRule } from 'webpack';

import type { StencilSSROptions } from '../types.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export interface StencilSSRWebpackPluginOptions extends StencilSSROptions {
  /**
   * A regex matching the files that may include Stencil components
   */
  include?: RegExp;
  /**
   * A regex matching the files that should be ignored by the plugin
   */
  exclude?: RegExp[];
  /**
   * The package reference that contains the Stencil runtime, e.g. `component-library/loader`
   */
  runtime?: string;
}

export interface MinimalWebpackConfig {
  options: {
    module: {
      rules: RuleSetRule[];
    };
  };
}

/**
 * A simple Webpack plugin that adds a banner comment to the top of output files.
 */
export class StencilSSRWebpackPlugin {
  #options: StencilSSROptions;
  #include: RegExp;
  #exclude: RegExp[];
  constructor(options: StencilSSRWebpackPluginOptions) {
    this.#options = options;
    this.#include = options.include ?? /\.js$/;
    this.#exclude = options.exclude ?? [/node_modules/];
  }

  apply(compiler: MinimalWebpackConfig): void {
    /**
     * adds our loader to the webpack config
     */
    compiler.options.module.rules.push({
      test: this.#include,
      exclude: this.#exclude,
      enforce: 'post',
      use: [
        {
          loader: path.resolve(__dirname, 'loader.js'),
          options: this.#options,
        },
      ],
    });
  }
}
