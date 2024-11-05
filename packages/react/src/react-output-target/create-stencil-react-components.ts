import type { ComponentCompilerMeta } from '@stencil/core/internal';
import { Project, VariableDeclarationKind } from 'ts-morph';
import { eventListenerName, kebabToPascalCase } from './utils/string-utils';

interface ReactEvent {
  originalName: string;
  name: string;
  type: string;
}

export const createStencilReactComponents = ({
  components,
  stencilPackageName,
  customElementsDir,
  defaultExport = false,
  hydrateModule,
  excludeServerSideRenderingFor,
}: {
  components: ComponentCompilerMeta[];
  stencilPackageName: string;
  customElementsDir: string;
  defaultExport?: boolean;
  hydrateModule?: string;
  excludeServerSideRenderingFor?: string[];
}) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const excludeSSRComponents = excludeServerSideRenderingFor || [];

  /**
   * automatically attach the `use client` directive if we are not generating
   * server side rendering components.
   */
  const useClientDirective = !hydrateModule ? `'use client';\n\n` : '';
  const importDirections = hydrateModule
    ? `
 * Do __not__ import components from this file as server side rendered components
 * may not hydrate due to missing Stencil runtime. Instead, import these components through the generated 'components.ts'
 * file that re-exports all components with the 'use client' directive.`
    : '';

  const autogeneratedComment = `/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.${importDirections}
 */\n\n`;

  const disableEslint = `/* eslint-disable */\n`;

  const runtimeImports = hydrateModule ? 'createComponent, createSSRComponent' : 'createComponent';
  const sourceFile = project.createSourceFile(
    'component.ts',
    `${useClientDirective}${autogeneratedComment}${disableEslint}
import React from 'react';
import { ${runtimeImports} } from '@stencil/react-output-target/runtime';
import type { EventName, StencilReactComponent } from '@stencil/react-output-target/runtime';
  `
  );

  for (const component of components) {
    const tagName = component.tagName;
    const reactTagName = kebabToPascalCase(tagName);
    const componentElement = `${reactTagName}Element`;
    const componentCustomEvent = `${reactTagName}CustomEvent`;

    sourceFile.addImportDeclaration({
      moduleSpecifier: `${stencilPackageName}/${customElementsDir}/${tagName}.js`,
      namedImports: [
        {
          name: reactTagName,
          alias: componentElement,
        },
        {
          name: 'defineCustomElement',
          alias: `define${reactTagName}`,
        },
      ],
    });

    const publicEvents = (component.events || []).filter((e) => e.internal === false);

    const events: ReactEvent[] = [];

    for (const event of publicEvents) {
      if (Object.keys(event.complexType.references).length > 0) {
        /**
         * Import the referenced types from the component library.
         * Stencil will automatically re-export type definitions from the components,
         * if they are used in the component's property or event types.
         */
        for (const referenceKey of Object.keys(event.complexType.references)) {
          const reference = event.complexType.references[referenceKey];
          const isGlobalType = reference.location === 'global';
          /**
           * Global type references should not have an explicit import.
           * The type should be available globally.
           */
          if (!isGlobalType) {
            sourceFile.addImportDeclaration({
              moduleSpecifier: stencilPackageName,
              namedImports: [
                {
                  name: referenceKey,
                  isTypeOnly: true,
                },
              ],
            });
          }
        }

        /**
         * Import the CustomEvent type for the web component from the Stencil package.
         *
         * For example:
         * ```
         * import type { ComponentCustomEvent } from 'my-component-library';
         * ```
         */
        sourceFile.addImportDeclaration({
          moduleSpecifier: stencilPackageName,
          namedImports: [
            {
              name: componentCustomEvent,
              isTypeOnly: true,
            },
          ],
        });

        events.push({
          originalName: event.name,
          name: eventListenerName(event.name),
          type: `EventName<${componentCustomEvent}<${event.complexType.original}>>`,
        });
      } else {
        events.push({
          originalName: event.name,
          name: eventListenerName(event.name),
          type: `EventName<CustomEvent<${event.complexType.original}>>`,
        });
      }
    }

    const componentEventNamesType = `${reactTagName}Events`;

    sourceFile.addTypeAlias({
      name: componentEventNamesType,
      type: events.length > 0 ? `{ ${events.map((e) => `${e.name}: ${e.type}`).join(',\n')} }` : 'NonNullable<unknown>',
    });

    const clientComponentCall = `/*@__PURE__*/ createComponent<${componentElement}, ${componentEventNamesType}>({
    tagName: '${tagName}',
    elementClass: ${componentElement},
    // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
    react: React,
    events: {${events.map((e) => `${e.name}: '${e.originalName}'`).join(',\n')}} as ${componentEventNamesType},
    defineCustomElement: define${reactTagName}
  })`;
    const serverComponentCall = `/*@__PURE__*/ createSSRComponent<${componentElement}, ${componentEventNamesType}>({
    tagName: '${tagName}',
    properties: {${component.properties
      /**
       * Filter out properties that don't have an attribute.
       * These are properties with complex types and can't be serialized.
       */
      .filter((prop) => Boolean(prop.attribute))
      .map((e) => `${e.name}: '${e.attribute}'`)
      .join(',\n')}},
    hydrateModule: import('${hydrateModule}')
  })`;

    const statement = sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      // React as never is a hack to by-pass a @types/react issue.
      declarations: [
        {
          name: reactTagName,
          type: `StencilReactComponent<${componentElement}, ${componentEventNamesType}>`,
          initializer:
            hydrateModule && !excludeSSRComponents.includes(tagName)
              ? `typeof window !== 'undefined'
              ? ${clientComponentCall}
              : ${serverComponentCall}`
              : clientComponentCall,
        },
      ],
    });

    if (defaultExport) {
      sourceFile.addExportAssignment({
        isExportEquals: false,
        expression: reactTagName,
      });
    } else {
      statement.setIsExported(true);
    }
  }

  sourceFile.organizeImports();
  sourceFile.formatText();

  return sourceFile.getFullText();
};
