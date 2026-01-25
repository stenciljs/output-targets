import type { OutputTargetCustom } from '@stencil/core/internal';
import path from 'node:path';

import { createReactTypes } from './generators/react.js';
import { createSvelteTypes } from './generators/svelte.js';
import { createSolidTypes } from './generators/solid.js';
import { createVueTypes } from './generators/vue.js';
import { createPreactTypes } from './generators/preact.js';

const DEFAULT_FILENAMES = {
  react: 'react-native-types.d.ts',
  svelte: 'svelte-native-types.d.ts',
  solid: 'solid-native-types.d.ts',
  vue: 'vue-native-types.d.ts',
  preact: 'preact-native-types.d.ts',
} as const;

export interface TypesOutputTargetOptions {
  /**
   * Specify the components that should be excluded from type generation.
   */
  excludeComponents?: string[];

  /**
   * Path to generate React 19+ type definitions.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/react-types.d.ts'`)
   * - A directory path (e.g., `'dist/types'`), which will generate `react-native-types.d.ts`
   *
   * **Note:** Your component library's `package.json` should include `@types/react` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "@types/react": ">=18" },
   *   "peerDependenciesMeta": { "@types/react": { "optional": true } }
   * }
   * ```
   */
  reactTypesPath?: string;

  /**
   * Path to generate Svelte type definitions.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/svelte-types.d.ts'`)
   * - A directory path (e.g., `'dist/types'`), which will generate `svelte-native-types.d.ts`
   *
   * **Note:** Your component library's `package.json` should include `svelte` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "svelte": ">=5" },
   *   "peerDependenciesMeta": { "svelte": { "optional": true } }
   * }
   * ```
   */
  svelteTypesPath?: string;

  /**
   * Path to generate Solid type definitions.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/solid-types.d.ts'`)
   * - A directory path (e.g., `'dist/types'`), which will generate `solid-native-types.d.ts`
   *
   * **Note:** Your component library's `package.json` should include `solid-js` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "solid-js": ">=1" },
   *   "peerDependenciesMeta": { "solid-js": { "optional": true } }
   * }
   * ```
   */
  solidTypesPath?: string;

  /**
   * Path to generate Vue 3 type definitions.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/vue-types.d.ts'`)
   * - A directory path (e.g., `'dist/types'`), which will generate `vue-native-types.d.ts`
   *
   * **Note:** Your component library's `package.json` should include `vue` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "vue": ">=3" },
   *   "peerDependenciesMeta": { "vue": { "optional": true } }
   * }
   * ```
   */
  vueTypesPath?: string;

  /**
   * Path to generate Preact type definitions.
   *
   * This can be either:
   * - A full file path ending in `.d.ts` (e.g., `'dist/types/preact-types.d.ts'`)
   * - A directory path (e.g., `'dist/types'`), which will generate `preact-native-types.d.ts`
   *
   * **Note:** Your component library's `package.json` should include `preact` as an
   * optional peer dependency to ensure proper TypeScript module resolution:
   * ```json
   * {
   *   "peerDependencies": { "preact": ">=10" },
   *   "peerDependenciesMeta": { "preact": { "optional": true } }
   * }
   * ```
   */
  preactTypesPath?: string;
}

/**
 * Resolves a path option to an absolute file path.
 * If the path ends with .d.ts, use it as-is. Otherwise, append the default filename.
 */
function resolveOutputPath(pathOption: string, defaultFilename: string, rootDir?: string): string {
  let outputPath = pathOption.endsWith('.d.ts') ? pathOption : path.join(pathOption, defaultFilename);

  if (!path.isAbsolute(outputPath) && rootDir) {
    outputPath = path.join(rootDir, outputPath);
  }

  return outputPath;
}

/**
 * Stencil output target for generating framework-specific type definitions.
 *
 * This output target generates TypeScript declaration files (.d.ts) that provide
 * type definitions for using Stencil web components as custom elements
 * in various frameworks.
 *
 * @example
 * ```ts
 * // stencil.config.ts
 * import { typesOutputTarget } from '@stencil/types-output-target';
 *
 * export const config: Config = {
 *   outputTargets: [
 *     typesOutputTarget({
 *       reactTypesPath: 'dist/types',
 *       svelteTypesPath: 'dist/types',
 *       solidTypesPath: 'dist/types',
 *       vueTypesPath: 'dist/types',
 *       preactTypesPath: 'dist/types',
 *     }),
 *   ],
 * };
 * ```
 */
export function typesOutputTarget(options: TypesOutputTargetOptions = {}): OutputTargetCustom {
  return {
    type: 'custom',
    name: 'types-output-target',
    validate(_config, diagnostics) {
      const hasAnyPath =
        options.reactTypesPath ||
        options.svelteTypesPath ||
        options.solidTypesPath ||
        options.vueTypesPath ||
        options.preactTypesPath;

      if (!hasAnyPath) {
        diagnostics.push({
          level: 'error',
          type: 'config',
          messageText:
            "The 'types-output-target' requires at least one framework path to be specified " +
            '(reactTypesPath, svelteTypesPath, solidTypesPath, vueTypesPath, or preactTypesPath).',
          lines: [],
        });
      }
    },
    async generator(_config, compilerCtx, buildCtx) {
      const timespan = buildCtx.createTimeSpan('generate types output target started', true);

      const components = buildCtx.components;
      const stencilPackageName = _config.fsNamespace || 'component-library';
      const rootDir = _config.rootDir;

      const tasks: Promise<unknown>[] = [];

      // Generate React types
      if (options.reactTypesPath) {
        const content = createReactTypes({
          components,
          stencilPackageName,
          excludeComponents: options.excludeComponents,
        });
        if (content) {
          const outputPath = resolveOutputPath(options.reactTypesPath, DEFAULT_FILENAMES.react, rootDir);
          tasks.push(compilerCtx.fs.writeFile(outputPath, content));
        }
      }

      // Generate Svelte types
      if (options.svelteTypesPath) {
        const content = createSvelteTypes({
          components,
          stencilPackageName,
          excludeComponents: options.excludeComponents,
        });
        if (content) {
          const outputPath = resolveOutputPath(options.svelteTypesPath, DEFAULT_FILENAMES.svelte, rootDir);
          tasks.push(compilerCtx.fs.writeFile(outputPath, content));
        }
      }

      // Generate Solid types
      if (options.solidTypesPath) {
        const content = createSolidTypes({
          components,
          stencilPackageName,
          excludeComponents: options.excludeComponents,
        });
        if (content) {
          const outputPath = resolveOutputPath(options.solidTypesPath, DEFAULT_FILENAMES.solid, rootDir);
          tasks.push(compilerCtx.fs.writeFile(outputPath, content));
        }
      }

      // Generate Vue types
      if (options.vueTypesPath) {
        const content = createVueTypes({
          components,
          stencilPackageName,
          excludeComponents: options.excludeComponents,
        });
        if (content) {
          const outputPath = resolveOutputPath(options.vueTypesPath, DEFAULT_FILENAMES.vue, rootDir);
          tasks.push(compilerCtx.fs.writeFile(outputPath, content));
        }
      }

      // Generate Preact types
      if (options.preactTypesPath) {
        const content = createPreactTypes({
          components,
          stencilPackageName,
          excludeComponents: options.excludeComponents,
        });
        if (content) {
          const outputPath = resolveOutputPath(options.preactTypesPath, DEFAULT_FILENAMES.preact, rootDir);
          tasks.push(compilerCtx.fs.writeFile(outputPath, content));
        }
      }

      await Promise.all(tasks);

      timespan.finish('generate types output target finished');
    },
  };
}

// Re-export generators for advanced usage
export { createReactTypes } from './generators/react.js';
export { createSvelteTypes } from './generators/svelte.js';
export { createSolidTypes } from './generators/solid.js';
export { createVueTypes } from './generators/vue.js';
export { createPreactTypes } from './generators/preact.js';
