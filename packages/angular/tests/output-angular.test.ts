import { describe, it, expect } from 'vitest';
import { ComponentCompilerEventComplexType, ComponentCompilerMeta, Config } from '@stencil/core/internal';
import {
  generateProxies,
  generateComponentProxy,
  generateBarrelFile,
  getPathToComponentTypes,
  usesExportMaps,
} from '../src/output-angular';
import { PackageJSON, OutputTargetAngular } from '../src/types';

const emptyConfig: Config = { outputTargets: [] } as unknown as Config;

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

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);
    expect(finalText.includes(`import { Components } from '../../angular/dist/types/components';`)).toBeFalsy();
    expect(finalText.includes(`import { Components } from 'component-library';`)).toBeTruthy();
  });

  it('should use a relative path to types when a component-library is not provided', () => {
    const outputTarget: OutputTargetAngular = {
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
    } as OutputTargetAngular;

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);
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

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);
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

    const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);
    expect(
      finalText.includes(
        `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone } from '@angular/core';`
      )
    ).toBeTruthy();
    expect(finalText.includes(`import { ProxyCmp } from './angular-component-lib/utils';`)).toBeTruthy();
  });

  describe('when booleanAttributes is enabled', () => {
    const booleanComponents = [
      {
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [
          { name: 'disabled', type: 'boolean', optional: false, required: false, internal: false },
          { name: 'detail', type: 'boolean', optional: true, required: false, internal: false },
          { name: 'color', type: 'string', optional: false, required: false, internal: false },
        ],
        virtualProperties: [],
        events: [],
        methods: [],
      },
    ] as unknown as ComponentCompilerMeta[];

    const createOutputTarget = (booleanAttributes?: boolean): OutputTargetAngular =>
      ({
        componentCorePackage: 'component-library',
        directivesProxyFile: '../component-library-angular/src/proxies.ts',
        booleanAttributes,
      }) as OutputTargetAngular;

    it('should transform boolean properties regardless of whether they are optional', () => {
      const finalText = generateProxies(booleanComponents, pkgData, createOutputTarget(true), rootDir, emptyConfig);

      expect(finalText).toContain(`{ name: 'disabled', transform: nullableBooleanAttribute }`);
      expect(finalText).toContain(`{ name: 'detail', transform: nullableBooleanAttribute }`);
    });

    it('should not transform properties that are not booleans', () => {
      const finalText = generateProxies(booleanComponents, pkgData, createOutputTarget(true), rootDir, emptyConfig);

      expect(finalText).not.toContain(`name: 'color'`);
    });

    it('should import the transform and leave the @angular/core imports untouched', () => {
      const finalText = generateProxies(booleanComponents, pkgData, createOutputTarget(true), rootDir, emptyConfig);

      expect(finalText).toContain(
        `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone } from '@angular/core';`
      );
      expect(finalText).toContain(`import { ProxyCmp } from './angular-component-lib/utils';`);
      expect(finalText).toContain(
        `import { nullableBooleanAttribute } from './angular-component-lib/boolean-attribute';`
      );
    });

    it('should not import the transform when it is not used', () => {
      const stringOnlyComponents = [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [{ name: 'color', type: 'string', optional: false, required: false, internal: false }],
          virtualProperties: [],
          events: [],
          methods: [],
        },
      ] as unknown as ComponentCompilerMeta[];

      const finalText = generateProxies(stringOnlyComponents, pkgData, createOutputTarget(true), rootDir, emptyConfig);

      expect(finalText).not.toContain('booleanAttribute');
      expect(finalText).toContain(`import { ProxyCmp } from './angular-component-lib/utils';`);
    });

    it('should not transform virtual properties', () => {
      /**
       * Virtual properties are declared with a free-form type string, so an exact `boolean`
       * match is not reliable enough to transform them.
       */
      const virtualComponents = [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          properties: [],
          virtualProperties: [{ name: 'hidden', type: 'boolean', docs: '' }],
          events: [],
          methods: [],
        },
      ] as unknown as ComponentCompilerMeta[];

      const finalText = generateProxies(virtualComponents, pkgData, createOutputTarget(true), rootDir, emptyConfig);

      expect(finalText).toContain(`inputs: ['hidden']`);
      expect(finalText).not.toContain('booleanAttribute');
    });

    it('should leave inputs untouched when not enabled', () => {
      const finalText = generateProxies(booleanComponents, pkgData, createOutputTarget(), rootDir, emptyConfig);

      expect(finalText).toContain(`inputs: ['color', 'detail', 'disabled']`);
      expect(finalText).not.toContain('booleanAttribute');
    });
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

      const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);

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

      const finalText = generateProxies(components, pkgData, outputTarget, rootDir, emptyConfig);

      expect(finalText.includes('export class MyComponentModule')).toBeFalsy();
    });
  });
});

describe('generateComponentProxy', () => {
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  };
  const rootDir: string = '';

  it('should generate a single component proxy file for standalone output', () => {
    const component: ComponentCompilerMeta = {
      tagName: 'my-component',
      properties: [{ name: 'value', type: 'string', attribute: 'value', internal: false }],
      events: [],
      methods: [],
      virtualProperties: [],
    } as unknown as ComponentCompilerMeta;

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'standalone',
      customElementsDir: 'components',
    };

    const result = generateComponentProxy(component, pkgData, outputTarget, rootDir, emptyConfig);

    expect(result).toContain(
      "import { defineCustomElement as defineMyComponent } from 'component-library/components/my-component.js';"
    );
    expect(result).toContain("import type { Components } from 'component-library/components';");
    expect(result).toContain('export class MyComponent');
  });

  it('should include NgModule for scam output', () => {
    const component: ComponentCompilerMeta = {
      tagName: 'my-button',
      properties: [],
      events: [],
      methods: [],
      virtualProperties: [],
    } as unknown as ComponentCompilerMeta;

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'scam',
      customElementsDir: 'components',
    };

    const result = generateComponentProxy(component, pkgData, outputTarget, rootDir, emptyConfig);

    expect(result).toContain('export class MyButtonModule');
    expect(result).toContain('NgModule');
  });

  it('should transform boolean properties when booleanAttributes is enabled', () => {
    const component: ComponentCompilerMeta = {
      tagName: 'my-component',
      properties: [
        { name: 'disabled', type: 'boolean', optional: false, internal: false },
        { name: 'detail', type: 'boolean', optional: true, internal: false },
      ],
      events: [],
      methods: [],
      virtualProperties: [],
    } as unknown as ComponentCompilerMeta;

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'standalone',
      customElementsDir: 'components',
      booleanAttributes: true,
    };

    const result = generateComponentProxy(component, pkgData, outputTarget, rootDir, emptyConfig);

    expect(result).toContain(`{ name: 'disabled', transform: nullableBooleanAttribute }`);
    expect(result).toContain(`{ name: 'detail', transform: nullableBooleanAttribute }`);
    expect(result).toContain(`import { ProxyCmp } from './angular-component-lib/utils';`);
    expect(result).toContain(`import { nullableBooleanAttribute } from './angular-component-lib/boolean-attribute';`);
  });

  it('should not transform boolean properties by default', () => {
    const component: ComponentCompilerMeta = {
      tagName: 'my-component',
      properties: [{ name: 'disabled', type: 'boolean', optional: false, internal: false }],
      events: [],
      methods: [],
      virtualProperties: [],
    } as unknown as ComponentCompilerMeta;

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'standalone',
      customElementsDir: 'components',
    };

    const result = generateComponentProxy(component, pkgData, outputTarget, rootDir, emptyConfig);

    expect(result).toContain(`inputs: ['disabled']`);
    expect(result).not.toContain('booleanAttribute');
  });
});

describe('lazyDefine', () => {
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  };
  const rootDir: string = '';

  const components = [
    {
      tagName: 'my-button',
      properties: [{ name: 'color', type: 'string', internal: false }],
      events: [],
      methods: [{ name: 'setFocus', internal: false }],
      virtualProperties: [],
    },
    {
      tagName: 'my-list',
      properties: [],
      events: [],
      methods: [],
      virtualProperties: [],
    },
  ] as unknown as ComponentCompilerMeta[];

  const createOutputTarget = (overrides: Partial<OutputTargetAngular> = {}): OutputTargetAngular => ({
    componentCorePackage: 'component-library',
    directivesProxyFile: '../component-library-angular/src/proxies.ts',
    outputType: 'standalone',
    customElementsDir: 'components',
    lazyDefine: true,
    ...overrides,
  });

  it.each(['standalone', 'scam'] as const)(
    'does not import any element statically for outputType "%s"',
    (outputType) => {
      const finalText = generateProxies(components, pkgData, createOutputTarget({ outputType }), rootDir, emptyConfig);

      expect(finalText).not.toContain('defineCustomElement');
      expect(finalText).not.toContain("import { ProxyCmp } from './angular-component-lib/utils';");
      expect(finalText).toContain(
        "import { LazyProxyCmp, defineOnCreate } from './angular-component-lib/lazy-define';"
      );
      expect(finalText).toContain(
        "defineOnCreate(this, ['color'], () => import('component-library/components/my-button.js'));"
      );
      expect(finalText).toContain("defineOnCreate(this, [], () => import('component-library/components/my-list.js'));");
    }
  );

  it('keeps the NgModule for each component with outputType "scam"', () => {
    const finalText = generateProxies(
      components,
      pkgData,
      createOutputTarget({ outputType: 'scam' }),
      rootDir,
      emptyConfig
    );

    expect(finalText).toContain('export class MyButtonModule');
    expect(finalText).toContain('export class MyListModule');
  });

  it('imports the element when the wrapper is created with esModules', () => {
    const result = generateComponentProxy(components[0], pkgData, createOutputTarget(), rootDir, emptyConfig);

    expect(result).not.toContain('defineCustomElement');
    expect(result).toContain("import { LazyProxyCmp, defineOnCreate } from './angular-component-lib/lazy-define';");
    expect(result).toContain(
      "defineOnCreate(this, ['color'], () => import('component-library/components/my-button.js'));"
    );
  });

  it('imports the element through the exports map in Stencil v5', () => {
    const config = { generateExportMaps: true, outputTargets: [{ type: 'standalone' }] } as any;

    const finalText = generateProxies(components, pkgData, createOutputTarget(), rootDir, config);
    const result = generateComponentProxy(components[0], pkgData, createOutputTarget(), rootDir, config);

    expect(finalText).toContain("defineOnCreate(this, ['color'], () => import('component-library/my-button'));");
    expect(result).toContain("defineOnCreate(this, ['color'], () => import('component-library/my-button'));");
  });

  it('follows customElementsDir', () => {
    const finalText = generateProxies(
      components,
      pkgData,
      createOutputTarget({ customElementsDir: 'custom-elements' }),
      rootDir,
      emptyConfig
    );

    expect(finalText).toContain("() => import('component-library/custom-elements/my-button.js')");
  });

  it.each(['standalone', 'scam'] as const)(
    'generates the same output for outputType "%s" when it is false as when it is not set',
    (outputType) => {
      const withoutOption = createOutputTarget({ outputType });
      delete withoutOption.lazyDefine;

      const expected = generateProxies(components, pkgData, withoutOption, rootDir, emptyConfig);
      const actual = generateProxies(
        components,
        pkgData,
        createOutputTarget({ outputType, lazyDefine: false }),
        rootDir,
        emptyConfig
      );

      expect(actual).toEqual(expected);
      expect(actual).toContain(
        "import { defineCustomElement as defineMyButton } from 'component-library/components/my-button.js';"
      );
      expect(actual).toContain('defineCustomElementFn: defineMyButton');
      expect(actual).not.toContain('defineOnCreate');
    }
  );
});

describe('generateBarrelFile', () => {
  it('should generate a barrel file that re-exports all components for standalone', () => {
    const components: ComponentCompilerMeta[] = [
      { tagName: 'my-button' },
      { tagName: 'my-input' },
    ] as unknown as ComponentCompilerMeta[];

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'standalone',
      customElementsDir: 'components',
    };

    const result = generateBarrelFile(components, outputTarget);

    expect(result).toContain("export { MyButton } from './my-button';");
    expect(result).toContain("export { MyInput } from './my-input';");
    expect(result).toContain('This file was automatically generated by the Stencil Angular Output Target.');
  });

  it('should include module exports for scam output', () => {
    const components: ComponentCompilerMeta[] = [{ tagName: 'my-button' }] as unknown as ComponentCompilerMeta[];

    const outputTarget: OutputTargetAngular = {
      componentCorePackage: 'component-library',
      directivesProxyFile: '../component-library-angular/src/proxies.ts',
      outputType: 'scam',
      customElementsDir: 'components',
    };

    const result = generateBarrelFile(components, outputTarget);

    expect(result).toContain("export { MyButton, MyButtonModule } from './my-button';");
  });
});

describe('usesExportMaps', () => {
  it('is true for a Stencil v5 project with generateExportMaps', () => {
    expect(usesExportMaps({ generateExportMaps: true, outputTargets: [{ type: 'standalone' }] } as any)).toBe(true);
  });

  it('is false for a Stencil v4 project, whose exports map lacks the entries the proxies need', () => {
    expect(usesExportMaps({ generateExportMaps: true, outputTargets: [{ type: 'dist-custom-elements' }] } as any)).toBe(
      false
    );
  });

  it('is false when generateExportMaps is not set', () => {
    expect(usesExportMaps({ outputTargets: [{ type: 'standalone' }] } as any)).toBe(false);
  });
});

describe('getPathToComponentTypes in Stencil v5', () => {
  it.each(['standalone', 'scam', 'component'])(
    'imports types for outputType "%s" from <pkg>/components with an exports map',
    (outputType) => {
      const config = {
        generateExportMaps: true,
        outputTargets: [{ type: 'standalone' }, { type: 'types', dir: 'build/typings' }],
      } as any;
      expect(getPathToComponentTypes(config, { componentCorePackage: 'my-lib', outputType } as any)).toBe(
        'my-lib/components'
      );
    }
  );

  it('imports types from the types dir without an exports map, following a custom dir', () => {
    const config = {
      rootDir: '/project',
      outputTargets: [{ type: 'standalone' }, { type: 'types', dir: '/project/build/typings' }],
    } as any;
    expect(
      getPathToComponentTypes(config, { componentCorePackage: 'my-lib', outputType: 'standalone' } as any)
    ).toBe('my-lib/build/typings/components');
  });
});
