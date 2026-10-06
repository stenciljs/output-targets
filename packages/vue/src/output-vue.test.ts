import { describe, it, expect } from 'vitest';

import { ComponentCompilerMeta, Config } from '@stencil/core/internal';
import {
  generateProxies,
  generateComponentProxy,
  generateBarrelFile,
  getPathToJSXTypes,
  usesExportMaps,
} from './output-vue';
import { PackageJSON, OutputTargetVue } from './types';

describe('generateProxies', () => {
  const components: ComponentCompilerMeta[] = [];
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  };
  const rootDir: string = '';
  const config: Config = { outputTargets: [] };

  it('should include both polyfills and definCustomElements when both are true in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: true,
      includeDefineCustomElements: true,
    };

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir);
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library';

import { applyPolyfills, defineCustomElements } from 'component-library/dist/loader';


applyPolyfills().then(() => defineCustomElements());


`
    );
  });

  it('should include only defineCustomElements when includePolyfills is false in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: false,
      includeDefineCustomElements: true,
    };

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir);
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library';

import { defineCustomElements } from 'component-library/dist/loader';


defineCustomElements();


`
    );
  });

  it('should not include defineCustomElements or applyPolyfills if both are false in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: false,
      includeDefineCustomElements: false,
    };

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir);
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library';






`
    );
  });
  it('should include importCustomElements if true in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includeImportCustomElements: true,
    };

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir);
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library';






`
    );
  });
  it('should include importCustomElements with custom path if defined in outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includeImportCustomElements: true,
      customElementsDir: 'custom-dir/hello',
    };

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir);
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library/custom-dir/hello';






`
    );
  });
});

describe('generateComponentProxy', () => {
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  };
  const rootDir: string = '';
  const config: Config = { outputTargets: [] };

  it('should generate a single component proxy file', () => {
    const component: ComponentCompilerMeta = {
      tagName: 'my-component',
      properties: [{ name: 'value', type: 'string', attribute: 'value' }],
      events: [{ name: 'myChange' }],
      methods: [],
    } as unknown as ComponentCompilerMeta;

    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includeImportCustomElements: true,
      customElementsDir: 'components',
    };

    const result = generateComponentProxy(config, component, pkgData, outputTarget, rootDir);

    expect(result).toContain(
      "import { defineCustomElement as defineMyComponent } from 'component-library/components/my-component.js';"
    );
    expect(result).toContain("import type { JSX } from 'component-library/components';");
    expect(result).toContain('export const MyComponent');
  });
});

describe('generateBarrelFile', () => {
  it('should generate a barrel file that re-exports all components', () => {
    const components: ComponentCompilerMeta[] = [
      { tagName: 'my-button' },
      { tagName: 'my-input' },
    ] as unknown as ComponentCompilerMeta[];

    const result = generateBarrelFile(components);

    expect(result).toContain("export { MyButton } from './my-button.js';");
    expect(result).toContain("export { MyInput } from './my-input.js';");
    expect(result).toContain('This file was automatically generated by the Stencil Vue Output Target.');
  });
});

describe('usesExportMaps', () => {
  it('is true for a Stencil v5 project with generateExportMaps', () => {
    const config = { generateExportMaps: true, outputTargets: [{ type: 'standalone' }] } as unknown as Config;
    expect(usesExportMaps(config)).toBe(true);
  });

  it('is false for a Stencil v4 project, whose exports map lacks the entries the proxies need', () => {
    const config = { generateExportMaps: true, outputTargets: [{ type: 'dist-custom-elements' }] } as unknown as Config;
    expect(usesExportMaps(config)).toBe(false);
  });

  it('is false when generateExportMaps is not set', () => {
    const config = { outputTargets: [{ type: 'standalone' }] } as unknown as Config;
    expect(usesExportMaps(config)).toBe(false);
  });
});

describe('getPathToJSXTypes with an exports map', () => {
  const config = { generateExportMaps: true, outputTargets: [{ type: 'standalone' }] } as unknown as Config;

  it('imports types from the standalone entry for a custom elements build', () => {
    expect(
      getPathToJSXTypes(config, { componentCorePackage: 'my-lib', includeImportCustomElements: true } as any)
    ).toBe('my-lib/standalone');
  });

  it('imports types from the loader entry otherwise', () => {
    expect(getPathToJSXTypes(config, { componentCorePackage: 'my-lib' } as any)).toBe('my-lib/loader');
  });
});
