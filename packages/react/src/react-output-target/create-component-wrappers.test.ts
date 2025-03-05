import { describe, it, expect } from 'vitest';
import { dedent } from 'ts-dedent';
import { Project } from 'ts-morph';

import { createComponentWrappers } from './create-component-wrappers.js';

describe('createComponentWrappers', () => {
  it('should generate a react component wrapper', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      project,
    });

    const sourceFile = sourceFiles[0];

    expect(sourceFile.getFullText()).toEqual(dedent`'use client';

/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */

/* eslint-disable */

import type { StencilReactComponent } from '@stencil/react-output-target/runtime';
import { createComponent } from '@stencil/react-output-target/runtime';
import { MyComponent as MyComponentElement, defineCustomElement as defineMyComponent } from "my-package/dist/custom-elements/my-component.js";
import React from 'react';

type MyComponentEvents = NonNullable<unknown>;

export const MyComponent: StencilReactComponent<MyComponentElement, MyComponentEvents> = /*@__PURE__*/ createComponent<MyComponentElement, MyComponentEvents>({
    tagName: 'my-component',
    elementClass: MyComponentElement,
    // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
    react: React,
    events: {} as MyComponentEvents,
    defineCustomElement: defineMyComponent
});

`);
  });

  it('should generate a react component wrapper with ES modules', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: true,
      project,
    });

    const sourceFile = sourceFiles[0];

    expect(sourceFile.getFullText()).toEqual(dedent`'use client';

/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */

/* eslint-disable */

import type { StencilReactComponent } from '@stencil/react-output-target/runtime';
import { createComponent } from '@stencil/react-output-target/runtime';
import { MyComponent as MyComponentElement, defineCustomElement as defineMyComponent } from "my-package/dist/custom-elements/my-component.js";
import React from 'react';

type MyComponentEvents = NonNullable<unknown>;

const MyComponent: StencilReactComponent<MyComponentElement, MyComponentEvents> = /*@__PURE__*/ createComponent<MyComponentElement, MyComponentEvents>({
    tagName: 'my-component',
    elementClass: MyComponentElement,
    // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
    react: React,
    events: {} as MyComponentEvents,
    defineCustomElement: defineMyComponent
});

export default MyComponent;

`);
  });

  it('should not generate component wrappers for internal components', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          properties: [],
          internal: true,
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: false,
      project,
    });

    expect(sourceFiles).toEqual([]);
  });

  it('should filter out excludedComponents', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: false,
      excludeComponents: ['my-component'],
      project,
    });

    expect(sourceFiles).toEqual([]);
  });

  it('should generate event types from references', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              internal: false,
              complexType: {
                original: 'IMyComponent.Events.Detail.MyComponentClicked',
                resolved: '{ element: HTMLMyComponentElement; context: MyComponent; event: Event; }',
                references: {
                  IButton: {
                    location: 'import',
                    path: '../../types/my-component',
                    id: 'src/types/my-component.d.ts::IMyComponent',
                  },
                },
              },
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: false,
      project,
    });

    const sourceFile = sourceFiles[0];

    expect(sourceFile.getFullText()).toEqual(dedent`'use client';

/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */

/* eslint-disable */

import type { EventName, StencilReactComponent } from '@stencil/react-output-target/runtime';
import { createComponent } from '@stencil/react-output-target/runtime';
import { type MyComponentCustomEvent } from "my-package";
import { MyComponent as MyComponentElement, defineCustomElement as defineMyComponent } from "my-package/dist/custom-elements/my-component.js";
import React from 'react';

type MyComponentEvents = { onMyEvent: EventName<MyComponentCustomEvent<IMyComponent.Events.Detail.MyComponentClicked>> };

export const MyComponent: StencilReactComponent<MyComponentElement, MyComponentEvents> = /*@__PURE__*/ createComponent<MyComponentElement, MyComponentEvents>({
    tagName: 'my-component',
    elementClass: MyComponentElement,
    // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
    react: React,
    events: { onMyEvent: 'myEvent' } as MyComponentEvents,
    defineCustomElement: defineMyComponent
});

    `);
  });

  it('creates next.js component wrappers', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [
            {
              name: 'hasMaxLength',
              attribute: 'max-length',
            },
            {
              name: 'links',
            },
          ],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: false,
      hydrateModule: 'my-package/hydrate',
      project,
    });

    const sourceFile = sourceFiles[0];

    const code = sourceFile.getFullText();
    expect(code).toContain('createComponent<MyComponentElement, MyComponentEvents>({');
    expect(code).toContain('createSSRComponent<MyComponentElement, MyComponentEvents>({');
  });

  it('can exclude components for server side rendering', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFiles = await createComponentWrappers({
      components: [
        {
          tagName: 'my-component-a',
          componentClassName: 'MyComponentA',
          properties: [
            {
              name: 'hasMaxLength',
              attribute: 'max-length',
            },
            {
              name: 'links',
            },
          ],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
        {
          tagName: 'my-component-b',
          componentClassName: 'MyComponentB',
          properties: [
            {
              name: 'hasMaxLength',
              attribute: 'max-length',
            },
            {
              name: 'links',
            },
          ],
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        } as any,
      ],
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outDir: 'dist/my-output-path',
      esModules: false,
      hydrateModule: 'my-package/hydrate',
      excludeServerSideRenderingFor: ['my-component-a'],
      project,
    });

    const sourceFile = sourceFiles[0];

    const code = sourceFile.getFullText();
    expect(code).toContain('createComponent<MyComponentAElement, MyComponentAEvents>({');
    expect(code).not.toContain('createSSRComponent<MyComponentAElement, MyComponentAEvents>({');
    expect(code).toContain('createComponent<MyComponentBElement, MyComponentBEvents>({');
    expect(code).toContain('createSSRComponent<MyComponentBElement, MyComponentBEvents>({');
  });
});
