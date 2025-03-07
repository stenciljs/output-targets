import path from 'node:path';
import type { ComponentCompilerMeta } from '@stencil/core/internal';
import { Project, SourceFile } from 'ts-morph';
import { createStencilReactComponents } from './create-stencil-react-components.js';
import type { RenderToStringOptions } from './runtime/ssr.js';

export const createComponentWrappers = async ({
  stencilPackageName,
  components,
  outDir,
  customElementsDir,
  excludeComponents,
  project,
  hydrateModule,
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
  const outputPath = path.join(outDir, `components.ts`);

  /**
   * create a client side component
   */
  const stencilReactComponent = createStencilReactComponents({
    components: filteredComponents,
    stencilPackageName,
    customElementsDir,
  });
  fileContents[outputPath] = stencilReactComponent;

  /**
   * create a server side component
   */
  if (hydrateModule) {
    const outputPath = path.join(outDir, `components.server.ts`);
    const stencilReactComponent = createStencilReactComponents({
      components: filteredComponents.filter(
        (c) => !excludeServerSideRenderingFor || !excludeServerSideRenderingFor.includes(c.tagName)
      ),
      stencilPackageName,
      customElementsDir,
      hydrateModule,
      serializeShadowRoot,
    });
    fileContents[outputPath] = stencilReactComponent;
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
