import type { ComponentCompilerMeta } from '@stencil/core/internal';
import path from 'node:path';
import { createEsModulesComponentsFile } from './create-es-modules-components-file.js';
import { createStencilReactComponents } from './create-stencil-react-components.js';
import { createTagTransformer } from './create-tag-transformer.js';
import type { RenderToStringOptions } from './runtime/ssr.js';

export const createComponentWrappers = ({
  stencilPackageName,
  components,
  outDir,
  esModules,
  customElementsDir,
  componentsTypesDir,
  excludeComponents,
  hydrateModule,
  clientModule,
  excludeServerSideRenderingFor,
  serializeShadowRoot,
  transformTag,
  exportMaps,
  typesFromComponentsFile,
}: {
  stencilPackageName: string;
  components: ComponentCompilerMeta[];
  customElementsDir: string;
  componentsTypesDir: string;
  outDir: string;
  esModules?: boolean;
  excludeComponents?: string[];
  hydrateModule?: string;
  clientModule?: string;
  excludeServerSideRenderingFor?: string[];
  serializeShadowRoot?: RenderToStringOptions['serializeShadowRoot'];
  transformTag?: boolean;
  exportMaps?: boolean;
  typesFromComponentsFile?: boolean;
}) => {
  const files: Record<string, string> = {};

  const filteredComponents = components.filter((c) => {
    if (c.internal) {
      /**
       * Skip internal components
       */
      return false;
    }

    /**
     * Skip excluded components
     */
    return !excludeComponents?.includes(c.tagName);
  });

  if (filteredComponents.length === 0) {
    return files;
  }

  /**
   * create a single file with all components or a separate file for each component
   * @param components - the components to create the file for
   * @param filename - the filename of the file to create
   */
  function createComponentFile(components: ComponentCompilerMeta[], filename = 'components') {
    /**
     * create a single file with all components
     */
    const outputPath = path.join(outDir, `${filename}.ts`);

    /**
     * create a client side component
     */
    files[outputPath] = createStencilReactComponents({
      components,
      stencilPackageName,
      customElementsDir,
      componentsTypesDir,
      exportMaps,
      typesFromComponentsFile,
      transformTag,
    });

    /**
     * create tag-transformer file (for both client and server)
     */
    if (transformTag) {
      files[path.join(outDir, 'tag-transformer.ts')] = createTagTransformer({
        stencilPackageName,
        customElementsDir,
        exportMaps,
      });
    }

    /**
     * create a server side component
     */
    if (hydrateModule) {
      const outputPath = path.join(outDir, `${filename}.server.ts`);

      files[outputPath] = createStencilReactComponents({
        components: components.filter((c) => !excludeServerSideRenderingFor?.includes(c.tagName)),
        stencilPackageName,
        customElementsDir,
        componentsTypesDir,
        exportMaps,
        typesFromComponentsFile,
        hydrateModule,
        clientModule,
        serializeShadowRoot,
        transformTag,
      });
    }
  }

  if (esModules) {
    /**
     * create a separate file for each component
     */
    for (const component of filteredComponents) {
      createComponentFile([component], component.tagName);
    }
    files[path.join(outDir, 'components.ts')] = createEsModulesComponentsFile({ components: filteredComponents });

    /**
     * Server barrel — mirrors the client barrel but points at `*.server.js` and
     * exposes a single shared `serializeShadowRoot` so SSR consumers can
     * tree-shake per-component imports.
     */
    if (hydrateModule) {
      files[path.join(outDir, 'components.server.ts')] = createEsModulesComponentsFile({
        components: filteredComponents.filter(
          (c) => !excludeServerSideRenderingFor || !excludeServerSideRenderingFor.includes(c.tagName)
        ),
        componentSuffix: '.server',
        serializeShadowRoot,
      });
    }
  } else {
    createComponentFile(filteredComponents);
  }

  return files;
};
