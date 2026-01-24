import type { BuildCtx, OutputTargetCustom, OutputTargetDistCustomElements } from '@stencil/core/internal';
import path from 'node:path';
import { Project } from 'ts-morph';
import { createComponentWrappers } from './create-component-wrappers.js';
import { createNativeTypes } from './create-native-types.js';
import type { RenderToStringOptions } from './runtime/ssr.js';

const DEFAULT_NATIVE_TYPES_FILENAME = 'react-native-types.d.ts';

export interface ReactOutputTargetOptions {
  /**
   * Specify the output directory or path where the generated React components will be saved.
   *
   * This option is required unless `nativeTypesPath` is specified. When only generating
   * native type definitions for React 19+, this option can be omitted.
   */
  outDir?: string;
  /**
   * Path to generate a TypeScript declaration file (.d.ts) that provides type definitions
   * for using Stencil web components as native custom elements in React 19+.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/my-types.d.ts'`) or
   * - A directory path (e.g., `'dist/types'`), which will generate `react-native-types.d.ts` in that directory
   *
   * **Important:** Your component library's `package.json` should include `@types/react` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "@types/react": ">=18" },
   *   "peerDependenciesMeta": { "@types/react": { "optional": true } }
   * }
   * ```
   *
   * Example usage in your React app:
   * ```tsx
   * // Import the generated types (side-effect import)
   * import 'my-library/react-native-types';
   *
   * // use your web components in jsx
   * ```
   */
  nativeTypesPath?: string;
  /**
   * Specify the components that should be excluded from the React output target.
   */
  excludeComponents?: string[];
  /**
   * The package name of the Stencil project.
   *
   * This value is automatically detected from the package.json file of the Stencil project.
   * If the validation fails, you can manually assign the package name.
   */
  stencilPackageName?: string;
  /**
   * The directory where the custom elements are saved.
   *
   * This value is automatically detected from the Stencil configuration file for the dist-custom-elements output target.
   * If you are working in an environment that uses absolute paths, consider setting this value manually.
   */
  customElementsDir?: string;
  /**
   * To enable server side rendering, provide the path to the hydrate module, e.g. `my-component/hydrate`.
   * By default this value is undefined and server side rendering is disabled.
   */
  hydrateModule?: string;
  /**
   * The name of the package that exports all React wrapped Stencil components for client side rendering.
   * This options is required when `hydrateModule` is set for server side rendering to work.
   */
  clientModule?: string;
  /**
   * Specify the components that should be excluded from server side rendering.
   */
  excludeServerSideRenderingFor?: string[];
  /**
   * If `true`, the output target will generate a separate ES module for each React component wrapper (better for tree-shaking).
   * @default false
   */
  esModules?: boolean;
  /**
   * Configure how Stencil serializes the components shadow root.
   * - If set to `declarative-shadow-dom` the component will be rendered within a Declarative Shadow DOM.
   * - If set to `scoped` Stencil will render the contents of the shadow root as a `scoped: true` component
   *   and the shadow DOM will be created during client-side hydration.
   * - Alternatively you can mix and match the two by providing an object with `declarative-shadow-dom` and `scoped` keys,
   * the value arrays containing the tag names of the components that should be rendered in that mode.
   *
   * Examples:
   * - `{ 'declarative-shadow-dom': ['my-component-1', 'another-component'], default: 'scoped' }`
   * Render all components as `scoped` apart from `my-component-1` and `another-component`
   * -  `{ 'scoped': ['an-option-component'], default: 'declarative-shadow-dom' }`
   * Render all components within `declarative-shadow-dom` apart from `an-option-component`
   * - `'scoped'` Render all components as `scoped`
   * - `false` disables shadow root serialization
   *
   * *NOTE* `true` has been deprecated in favor of `declarative-shadow-dom` and `scoped`
   * @default 'declarative-shadow-dom'
   */
  serializeShadowRoot?: RenderToStringOptions['serializeShadowRoot'];
  /**
   * Use `transformTag` to enable runtime tag name transformation for your components.
   * When enabled, the output target will import `transformTag` from your component library
   * and apply it when rendering components.
   *
   * You must export `transformTag` from the root entry of your component library:
   * ```ts
   * // src/index.ts
   * export { transformTag } from '@stencil/core';
   * ```
   *
   * @default false
   */
  transformTag?: boolean;
}

const PLUGIN_NAME = 'react-output-target';

const DIST_CUSTOM_ELEMENTS_DEFAULT_DIR = 'dist/components';
const DIST_CUSTOM_ELEMENTS = 'dist-custom-elements';
const HYDRATE_OUTPUT_TARGET = 'dist-hydrate-script';

interface ReactOutputTarget extends OutputTargetCustom {
  __internal_getCustomElementsDir: () => string;
}

/**
 * Creates an output target for binding Stencil components to be used in a React context
 * @public
 * @param outputTarget the user-defined output target defined in a Stencil configuration file
 * @returns an output target that can be used by the Stencil compiler
 */
export const reactOutputTarget = ({
  outDir,
  nativeTypesPath,
  esModules,
  stencilPackageName,
  excludeComponents,
  customElementsDir: customElementsDirOverride,
  hydrateModule,
  clientModule,
  excludeServerSideRenderingFor,
  serializeShadowRoot,
  transformTag,
}: ReactOutputTargetOptions): ReactOutputTarget => {
  let customElementsDir = DIST_CUSTOM_ELEMENTS_DEFAULT_DIR;
  return {
    type: 'custom',
    name: PLUGIN_NAME,
    validate(config) {
      /**
       * Validate that at least one output is configured.
       */
      if (!outDir && !nativeTypesPath) {
        throw new Error(`The '${PLUGIN_NAME}' requires either 'outDir' or 'nativeTypesPath' to be specified.`);
      }

      /**
       * Validate the configuration to ensure that the dist-custom-elements
       * output target is defined in the Stencil configuration when generating
       * wrapper components (outDir is set).
       *
       * This context is used to detect a customized output path.
       */
      if (outDir) {
        if (customElementsDirOverride) {
          customElementsDir = customElementsDirOverride;
        } else {
          const customElementsOutputTarget = (config.outputTargets || []).find(
            (o) => o.type === DIST_CUSTOM_ELEMENTS
          ) as OutputTargetDistCustomElements;
          if (customElementsOutputTarget == null) {
            throw new Error(
              `The '${PLUGIN_NAME}' requires '${DIST_CUSTOM_ELEMENTS}' output target when 'outDir' is specified. Add { type: '${DIST_CUSTOM_ELEMENTS}' }, to the outputTargets config.`
            );
          }
          if (customElementsOutputTarget.dir !== undefined) {
            /**
             * If the developer has configured a custom output path for the Stencil components,
             * we need to use that path when importing the components in the React components.
             */
            customElementsDir = customElementsOutputTarget.dir;
          }

          /**
           * Validate the configuration for `dist-custom-elements` output target to ensure that
           * the bundle generates its own runtime. This is important because we need to ensure that
           * the Stencil runtime has hydration flags set which the default Stencil runtime does not have.
           */
          if (customElementsOutputTarget.externalRuntime !== false) {
            throw new Error(
              `The '${PLUGIN_NAME}' requires the '${DIST_CUSTOM_ELEMENTS}' output target to have 'externalRuntime: false' set in its configuration.`
            );
          }
        }

        /**
         * Validate the configuration to ensure that the dist-hydrate-script
         * output target is defined in the Stencil configuration if the hydrateModule is provided.
         */
        if (hydrateModule) {
          const hydrateOutputTarget = (config.outputTargets || []).find((o) => o.type === HYDRATE_OUTPUT_TARGET);
          if (hydrateOutputTarget == null) {
            throw new Error(
              `The '${PLUGIN_NAME}' requires '${HYDRATE_OUTPUT_TARGET}' output target when the 'hydrateModule' option is set. Add { type: '${HYDRATE_OUTPUT_TARGET}' }, to the outputTargets config.`
            );
          }

          if (clientModule == null) {
            throw new Error(
              `The '${PLUGIN_NAME}' requires the 'clientModule' option when the 'hydrateModule' option is set. Please provide the clientModule manually to the ${PLUGIN_NAME} output target.`
            );
          }
        }
      }

      /**
       * Validate the configuration to detect the package name of the Stencil project.
       */
      if (stencilPackageName === undefined) {
        if (config.sys && config.packageJsonFilePath) {
          const { name: packageName } = JSON.parse(config.sys.readFileSync(config.packageJsonFilePath, 'utf8'));
          stencilPackageName = packageName;
        }

        if (!stencilPackageName) {
          throw new Error(
            `Unable to find the package name in the package.json file: ${config.packageJsonFilePath}. Please provide the stencilPackageName manually to the ${PLUGIN_NAME} output target.`
          );
        }
      }
    },
    async generator(_config, compilerCtx, buildCtx: BuildCtx) {
      const timespan = buildCtx.createTimeSpan(`generate ${PLUGIN_NAME} started`, true);

      const components = buildCtx.components;

      // Generate wrapper components if outDir is specified
      if (outDir) {
        const project = new Project();

        const sourceFiles = await createComponentWrappers({
          outDir,
          components,
          stencilPackageName: stencilPackageName!,
          customElementsDir,
          excludeComponents,
          esModules: esModules === true,
          project,
          hydrateModule,
          clientModule,
          excludeServerSideRenderingFor,
          serializeShadowRoot,
          transformTag,
        });

        await Promise.all(
          sourceFiles.map((sourceFile) => compilerCtx.fs.writeFile(sourceFile.getFilePath(), sourceFile.getFullText()))
        );
      }

      // Generate native types if nativeTypesPath is specified
      if (nativeTypesPath) {
        const nativeTypesContent = createNativeTypes({
          components,
          stencilPackageName: stencilPackageName!,
          excludeComponents,
        });

        if (nativeTypesContent) {
          // If the path doesn't end with .d.ts, treat it as a directory and append the default filename
          let outputPath = nativeTypesPath.endsWith('.d.ts')
            ? nativeTypesPath
            : path.join(nativeTypesPath, DEFAULT_NATIVE_TYPES_FILENAME);

          // Normalize to absolute path if relative
          if (!path.isAbsolute(outputPath) && _config.rootDir) {
            outputPath = path.join(_config.rootDir, outputPath);
          }

          await compilerCtx.fs.writeFile(outputPath, nativeTypesContent);
        }
      }

      timespan.finish(`generate ${PLUGIN_NAME} finished`);
    },
    __internal_getCustomElementsDir() {
      return customElementsDir;
    },
  };
};
