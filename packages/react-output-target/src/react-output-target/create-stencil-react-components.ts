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
  useClient = false,
}: {
  components: ComponentCompilerMeta[];
  stencilPackageName: string;
  customElementsDir: string;
  defaultExport?: boolean;
  useClient?: boolean;
}) => {
  const project = new Project({ useInMemoryFileSystem: true });

  const useClientDirective = useClient ? `'use client';\n\n` : '';

  const autogeneratedComment = `/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */\n\n`;

  const disableEslint = `/* eslint-disable */\n`;

  const sourceFile = project.createSourceFile(
    'component.ts',
    `${useClientDirective}${autogeneratedComment}${disableEslint}
import React from 'react';
import { createComponent } from '@stencil/react-output-target/runtime';
import type { EventName } from '@stencil/react-output-target/runtime';
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
      /**
       * A reference type may contain a name that conflicts with an already existing variable name
       * that we've previously defined, like the component constant: "MyComponent".
       *
       * To avoid this, we need to check if the reference type includes a match for the original name
       * and replace it with the alias we've defined: "MyComponentElement".
       *
       * The regular expression matches the original name with a space before and a semicolon after.
       * This is to prevent matching the original name as a substring of another variable name.
       *
       */
      const regex = new RegExp(`(?<=\\s)${reactTagName};`, 'g');
      const eventComplexTypeResolved = event.complexType.resolved.replace(regex, `${componentElement};`);
      const hasComplexType = Object.keys(event.complexType.references).includes(event.complexType.original);

      if (hasComplexType) {
        const isGlobalType = event.complexType.references[event.complexType.original].location === 'global';
        /**
         * Global type references should not have an explicit import.
         * The type should be available globally.
         */
        if (!isGlobalType) {
          sourceFile.addImportDeclaration({
            moduleSpecifier: stencilPackageName,
            namedImports: [
              {
                name: event.complexType.original,
                isTypeOnly: true,
              },
            ],
          });
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
          type: `EventName<${componentCustomEvent}<${eventComplexTypeResolved}>>`,
        });
      } else {
        events.push({
          originalName: event.name,
          name: eventListenerName(event.name),
          type: `EventName<CustomEvent<${eventComplexTypeResolved}>>`,
        });
      }
    }

    const componentEventNamesType = `${reactTagName}Events`;

    sourceFile.addTypeAlias({
      name: componentEventNamesType,
      type: events.length > 0 ? `{ ${events.map((e) => `${e.name}: ${e.type}`).join(',\n')} }` : 'NonNullable<unknown>',
    });

    const statement = sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      // React as never is a hack to by-pass a @types/react issue.
      declarations: [
        {
          name: reactTagName,
          initializer: `/*@__PURE__*/ createComponent<${componentElement}, ${componentEventNamesType}>({
          tagName: '${tagName}',
          elementClass: ${componentElement},
          react: React,
          events: { ${events.map((e) => `${e.name}: '${e.originalName}'`).join(',\n')}} as ${componentEventNamesType},
          defineCustomElement: define${reactTagName}
        })`,
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
