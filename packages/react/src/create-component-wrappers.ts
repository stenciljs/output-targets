import type { ComponentCompilerMeta } from '@stencil/core/internal';
import path from 'node:path';
import { Project, SourceFile } from 'ts-morph';
import { createEsModulesComponentsFile } from './create-es-modules-components-file.js';
import { createStencilReactComponents } from './create-stencil-react-components.js';
import type { RenderToStringOptions } from './runtime/ssr.js';

export const createComponentWrappers = async ({
  stencilPackageName,
  components,
  outDir,
  esModules,
  customElementsDir,
  excludeComponents,
  project,
  hydrateModule,
  clientModule,
  excludeServerSideRenderingFor,
  serializeShadowRoot,
}: {
  stencilPackageName: string;
  components: ComponentCompilerMeta[];
  customElementsDir: string;
  outDir: string;
  esModules?: boolean;
  excludeComponents?: string[];
  project: Project;
  hydrateModule?: string;
  clientModule?: string;
  excludeServerSideRenderingFor?: string[];
  serializeShadowRoot?: RenderToStringOptions['serializeShadowRoot'];
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
    const stencilReactComponent = createStencilReactComponents({
      components,
      stencilPackageName,
      customElementsDir,
    });
    fileContents[outputPath] = stencilReactComponent;

    /**
     * create a server side component
     */
    if (hydrateModule) {
      const outputPath = path.join(outDir, `${filename}.server.ts`);
      const stencilReactComponent = createStencilReactComponents({
        components: components.filter(
          (c) => !excludeServerSideRenderingFor || !excludeServerSideRenderingFor.includes(c.tagName)
        ),
        stencilPackageName,
        customElementsDir,
        hydrateModule,
        clientModule,
        serializeShadowRoot,
      });
      fileContents[outputPath] = stencilReactComponent;
    }
  }

  if (esModules) {
    /**
     * create a separate file for each component
     */
    for (const component of filteredComponents) {
      createComponentFile([component], component.tagName);
    }
    const componentsSource = await createEsModulesComponentsFile({ components: filteredComponents, project, outDir });
    sourceFiles.push(componentsSource);
  } else {
    createComponentFile(filteredComponents);
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
