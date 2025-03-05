import path from 'node:path';
import type { ComponentCompilerMeta } from '@stencil/core/internal';
import { Project, SourceFile } from 'ts-morph';
import { createStencilReactComponents } from './create-stencil-react-components.js';
import { createStencilNextComponents } from './create-next-wrapper.js';
import { kebabToPascalCase } from './utils/string-utils.js';

export const createComponentWrappers = async ({
  stencilPackageName,
  components,
  outDir,
  customElementsDir,
  esModules,
  excludeComponents,
  project,
  hydrateModule,
  excludeServerSideRenderingFor,
}: {
  stencilPackageName: string;
  components: ComponentCompilerMeta[];
  customElementsDir: string;
  outDir: string;
  esModules?: boolean;
  excludeComponents?: string[];
  project: Project;
  hydrateModule?: string;
  excludeServerSideRenderingFor?: string[];
}) => {
  const sourceFiles: SourceFile[] = [];

  const filteredComponents = components.filter((c) => {
    if (c.internal === true) {
      /**
       * Skip internal components
       */
      return false;
    }
    if (excludeComponents?.includes(c.tagName)) {
      /**
       * Skip excluded components
       */
      return false;
    }

    return true;
  });

  if (filteredComponents.length === 0) {
    return [];
  }

  const fileContents: Record<string, string> = {};
  if (esModules === true) {
    /**
     * Generate an entry point for each individual component
     */
    for (const component of filteredComponents) {
      const fileName = kebabToPascalCase(component.tagName);
      const outputPath = path.join(outDir, `${fileName}.ts`);

      const stencilReactComponent = createStencilReactComponents({
        components: [component],
        stencilPackageName,
        customElementsDir,
        defaultExport: true,
        hydrateModule,
        excludeServerSideRenderingFor,
      });
      fileContents[outputPath] = stencilReactComponent;
    }
  } else {
    /**
     * Generate a single entry point for all the components
     */
    const outputPath = hydrateModule
      ? /**
         * If hydrate module is provided, we bundle all components in a single file for server side rendering.
         * Further down we then create a re-export file that imports this file and exports all components with
         * the 'use client' directive to ensure that the Stencil runtime is always being loaded but components
         * are also being rendered server side
         */
        path.join(outDir, 'components.server.ts')
      : path.join(outDir, 'components.ts');
    const stencilReactComponent = createStencilReactComponents({
      components: filteredComponents,
      stencilPackageName,
      customElementsDir,
      defaultExport: false,
      hydrateModule,
      excludeServerSideRenderingFor,
    });
    fileContents[outputPath] = stencilReactComponent;
  }

  if (hydrateModule) {
    const outputPath = path.join(outDir, 'components.ts');
    const clientReExport = createStencilNextComponents({
      components: filteredComponents,
      esModules,
    });
    fileContents[outputPath] = clientReExport;
  }

  await Promise.all(
    Object.entries(fileContents).map(async ([outputPath, content]) => {
      const sourceFile = project.createSourceFile(outputPath, content, { overwrite: true });
      await sourceFile.save();
      sourceFiles.push(sourceFile);
    })
  );

  return sourceFiles;
};
