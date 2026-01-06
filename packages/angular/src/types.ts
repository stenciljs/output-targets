/**
 * The type of output that can be generated with the Angular output target.
 * - `component` - Generate many component wrappers tied to a single Angular module (lazy/hydrated approach).
 * - `scam` - Generate a Single Component Angular Module for each component.
 * - `standalone` - Generates standalone components.
 */
export type OutputType = 'component' | 'scam' | 'standalone';

export interface OutputTargetAngular {
  /**
   * The package name of the component library.
   * This is used to generate the import statements.
   */
  componentCorePackage: string;
  /**
   * The path to the proxy file that will be generated. This can be an absolute path
   * or a relative path from the root directory of the Stencil library.
   */
  directivesProxyFile: string;
  directivesArrayFile?: string;
  valueAccessorConfigs?: ValueAccessorConfig[];
  excludeComponents?: string[];
  customElementsDir?: string;
  /**
   * The type of output that should be generated.
   * - `component` - Generate many component wrappers tied to a single Angular module (lazy/hydrated approach).
   * - `scam` - Generate a Single Component Angular Module for each component.
   * - `standalone` - (default) Generates standalone components.
   */
  outputType?: OutputType;
  /**
   * Experimental (!)
   * When true, tries to inline the properties of components. This is required to enable Angular Language Service
   * to type-check and show jsdocs when using the components in html-templates.
   */
  inlineProperties?: boolean;
  /**
   * Use `transformTag` to generate a build-time script.
   * This script patches Angular `@Component` selectors in any installed Angular wrapper library
   * enabling run-time tag transformation. Run the script as a postinstall script in your app.
   *
   * Setup:
   * 1. Export `transformTag` and `setTagTransformer` from your component library:
   * ```ts
   * // src/index.ts
   * export { transformTag, setTagTransformer } from '@stencil/core';
   * ```
   *
   * 2. Add the patch script as a postinstall hook in your consuming app's package.json:
   * ```json
   * {
   *   "scripts": {
   *     "postinstall": "patch-transform-selectors \"(tag) => tag.startsWith('my-') ? `v1-${tag}` : tag\""
   *   }
   * }
   * ```
   *
   * 3. Configure the transformer at runtime in your Angular app with the SAME transformer:
   * ```ts
   * // main.ts
   * import { setTagTransformer } from 'component-library';
   * setTagTransformer((tag) => tag.startsWith('my-') ? `v1-${tag}` : tag);
   * ```
   *
   * Angular relies on a static selector string so the patch script is used to 
   * modify the installed Angular component library for transformed tags. 
   * For example, if `my-button` transforms to `v1-my-button`, the selector
   * will be patched from `selector: 'my-button'` to `selector: 'v1-my-button'`. 
   *
   * @default false
   */
  transformTag?: boolean;
}

export type ValueAccessorTypes = 'text' | 'radio' | 'select' | 'number' | 'boolean';

export interface ValueAccessorConfig {
  elementSelectors: string | string[];
  event: string;
  targetAttr: string;
  type: ValueAccessorTypes;
}

export interface PackageJSON {
  types: string;
}

export interface ComponentInputProperty {
  name: string;
  required: boolean;
}
