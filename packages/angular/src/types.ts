/**
 * The type of output that can be generated with the Angular output target.
 * - `component` - Generate many component wrappers tied to a single Angular module (requires `dist`, lazy/hydrated approach).
 * - `scam` - Generate a Single Component Angular Module for each component (requires `dist-custom-elements` output).
 * - `standalone` - Generates standalone components (requires `dist-custom-elements` output).
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
  /**
   * Optional path to generate a file containing a `DIRECTIVES` array constant.
   * This is primarily useful with `outputType: 'component'` (lazy-loaded) where you want
   * to declare all components in a shared NgModule:
   *
   * ```ts
   * import { DIRECTIVES } from './directives';
   *
   * @NgModule({
   *   declarations: [...DIRECTIVES],
   *   exports: [...DIRECTIVES],
   * })
   * export class ComponentLibraryModule {}
   * ```
   *
   * This option is less relevant for `outputType: 'scam'` or `'standalone'` where
   * consumers typically import individual component modules or standalone components directly.
   */
  directivesArrayFile?: string;
  valueAccessorConfigs?: ValueAccessorConfig[];
  excludeComponents?: string[];
  customElementsDir?: string;
  /**
   * The type of output that should be generated.
   * - `component` - Generate many component wrappers tied to a single Angular module (requires `dist`, lazy/hydrated approach).
   * - `scam` - Generate a Single Component Angular Module for each component (requires `dist-custom-elements` output).
   * - `standalone` - (default) Generates standalone components (requires `dist-custom-elements` output).
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
  /**
   * If `true`, the output target will generate a separate ES module for each Angular component wrapper.
   * This enables better tree-shaking as bundlers can exclude unused components.
   * This option only applies when `outputType` is `'scam'` or `'standalone'` (i.e., using `dist-custom-elements`).
   * @default false
   */
  esModules?: boolean;
  /**
   * When `true`, boolean properties are declared with an Angular input transform so they can
   * be set using attribute presence syntax:
   *
   * ```html
   * <!-- with booleanAttributes enabled -->
   * <my-component disabled></my-component>
   *
   * <!-- otherwise the value has to be bound explicitly -->
   * <my-component [disabled]="true"></my-component>
   * ```
   *
   * Without a transform Angular resolves the bare attribute to the empty string and reports
   * `Type 'string' is not assignable to type 'boolean'` under `strictTemplates`.
   *
   * Compile-time checking of these bindings also requires `inlineProperties`. Without it the
   * generated wrappers declare no typed members for their inputs, so Angular never checks them
   * and there is no error for the transform to resolve.
   *
   * The transform still runs either way, because Angular applies it from the component
   * definition's input map rather than from a declared class member. Enabling this on its own
   * therefore moves boolean coercion from Stencil to the transform with nothing checking what
   * callers pass, so prefer enabling `inlineProperties` alongside it.
   *
   * The transform coerces strings the same way Angular's `booleanAttribute` does, but passes
   * `null` and `undefined` through instead of coercing them to `false`. Refer to
   * `nullableBooleanAttribute`.
   *
   * Properties are only transformed when Stencil reports their type as exactly `boolean`.
   * Virtual properties, properties declared as `any`, and types that union `boolean` with
   * something else (such as `boolean | 'auto'`, reported as `any`) get no transform, and the
   * property receives the attribute's empty string rather than `true`. Only the union case fails
   * to compile; the other two are silent. Refer to the README for the differences.
   *
   * @default false
   */
  booleanAttributes?: boolean;
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
  /**
   * Whether to declare an input transform so the property can be set by attribute presence.
   */
  transform?: boolean;
}
