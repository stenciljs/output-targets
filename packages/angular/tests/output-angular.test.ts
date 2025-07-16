import { describe, it, expect } from 'vitest';
import { ComponentCompilerEventComplexType, ComponentCompilerMeta } from '@stencil/core/internal';
import { generateProxies } from '../src/output-angular';
import { PackageJSON, OutputTargetAngular } from '../src/types';

describe('generateProxies', () => {
  const components: ComponentCompilerMeta[] = [];
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  };
  const rootDir: string = '';

  it('should use types from the component-library when it is provided to the config', () => {
    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'component',
    };

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir);
    expect(finalText.includes(`import { Components } from '../../angular/dist/types/components';`)).toBeFalsy();
    expect(finalText.includes(`import { Components } from 'component-library';`)).toBeTruthy();
  });

  it('should use a relative path to types when a component-library is not provided', () => {
    const outputTarget: OutputTargetAngular = {
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
    } as OutputTargetAngular;

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir);
    expect(finalText).not.toContain(`import { Components } from 'component-library';`);
    expect(finalText).toContain(`import { Components } from '../../angular/dist/types/components';`);
  });

  it('should include output related imports when there is component with not internal event', () => {
    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
    } as OutputTargetAngular;
    const components = [
      {
        tagName: 'component-with-event',
        hasEvent: true,
        events: [
          {
            name: 'fake-external-event-name',
            internal: false,
            docs: {
              text: '',
              tags: [],
            },
            complexType: {
              original: '',
              resolved: '',
              references: { fakeReference: { location: 'local', id: '' } },
            } as ComponentCompilerEventComplexType,
          },
        ],
      },
    ] as unknown as ComponentCompilerMeta[];

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir);
    expect(
      finalText.includes(
        `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';`
      )
    ).toBeTruthy();
    expect(finalText.includes(`import { ProxyCmp } from './angular-component-lib/utils';`)).toBeTruthy();
  });

  it('should not include output related imports when there is component with no events or internal ones', () => {
    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
    } as OutputTargetAngular;
    const components = [
      {
        tagName: 'component-without-events',
        hasEvent: false,
        events: [],
      },
      {
        tagName: 'component-with-internal-event',
        hasEvent: true,
        events: [
          {
            name: 'fake-internal-event-name',
            internal: true,
            docs: {
              text: '',
              tags: [],
            },
            complexType: {
              original: '',
              resolved: '',
              references: { fakeReference: { location: 'local', id: '' } },
            } as ComponentCompilerEventComplexType,
          },
        ],
      },
    ] as unknown as ComponentCompilerMeta[];

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir);
    expect(
      finalText.includes(
        `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone } from '@angular/core';`
      )
    ).toBeTruthy();
    expect(finalText.includes(`import { ProxyCmp } from './angular-component-lib/utils';`)).toBeTruthy();
  });

  describe('when outputType is scam', () => {
    it('should include an Angular module for each component', () => {
      const outputTarget: OutputTargetAngular = {
        directivesProxyFile: '../component-library-angular/src/proxies.ts',
        outputType: 'scam',
        componentCorePackage: '@ionic/core',
      };

      components.push({
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [],
        virtualProperties: [],
        events: [],
        methods: [],
      } as unknown as ComponentCompilerMeta);

      const finalText = generateProxies(components, pkgData, outputTarget, rootDir);

      expect(finalText.includes('export class MyComponentModule')).toBeTruthy();
    });
  });

  describe('when outputType is component', () => {
    it('should not include an Angular module for each component', () => {
      const outputTarget: OutputTargetAngular = {
        directivesProxyFile: '../component-library-angular/src/proxies.ts',
        outputType: 'component',
        componentCorePackage: '@ionic/core',
      };

      components.push({
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [],
        virtualProperties: [],
        events: [],
        methods: [],
      } as unknown as ComponentCompilerMeta);

      const finalText = generateProxies(components, pkgData, outputTarget, rootDir);

      expect(finalText.includes('export class MyComponentModule')).toBeFalsy();
    });
  });
});
