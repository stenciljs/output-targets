import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import type { ComponentCompilerMeta } from '@stencil/core/internal';

import { typesOutputTarget, type TypesOutputTargetOptions } from './index.js';

import { createReactTypes } from './generators/react.js';
import { createSvelteTypes } from './generators/svelte.js';
import { createSolidTypes } from './generators/solid.js';
import { createVueTypes } from './generators/vue.js';
import { createPreactTypes } from './generators/preact.js';

const createMockComponent = (overrides: Partial<ComponentCompilerMeta> = {}): ComponentCompilerMeta =>
  ({
    tagName: 'my-button',
    componentClassName: 'MyButton',
    properties: [
      {
        name: 'disabled',
        attribute: 'disabled',
        internal: false,
        complexType: { original: 'boolean', resolved: 'boolean', references: {} },
        docs: { text: 'Whether the button is disabled', tags: [] },
      },
    ],
    events: [
      {
        name: 'myClick',
        internal: false,
        complexType: { original: 'void', resolved: 'void', references: {} },
        docs: { text: 'Emitted when the button is clicked', tags: [] },
      },
    ],
    internal: false,
    ...overrides,
  }) as ComponentCompilerMeta;

describe('createReactTypes', () => {
  it('should generate React 19+ native types', () => {
    const result = createReactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'react/jsx-runtime'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'disabled'?: boolean;`);
    expect(result).toContain(`'onmyclick'?:`); // lowercase event handler
    expect(result).toContain(`'my-button': DetailedHTMLProps`);
  });

  it('should return empty string for no components', () => {
    const result = createReactTypes({
      components: [],
      stencilPackageName: 'my-package',
    });

    expect(result).toBe('');
  });

  it('should exclude internal components', () => {
    const result = createReactTypes({
      components: [createMockComponent({ internal: true })],
      stencilPackageName: 'my-package',
    });

    expect(result).toBe('');
  });
});

describe('createSvelteTypes', () => {
  it('should generate Svelte native types', () => {
    const result = createSvelteTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'svelte/elements'`);
    expect(result).toContain(`interface SvelteHTMLElements`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onmyclick'?:`);
  });
});

describe('createSolidTypes', () => {
  it('should generate Solid native types with prop: and attr: prefixes', () => {
    const result = createSolidTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'solid-js'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'prop:disabled'?: boolean;`);
    expect(result).toContain(`'attr:disabled'?: string;`);
    expect(result).toContain(`'on:myClick'?:`);
  });
});

describe('createVueTypes', () => {
  it('should generate Vue 3 native types', () => {
    const result = createVueTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'vue'`);
    expect(result).toContain(`interface GlobalComponents`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onMyClick'?:`); // Vue uses camelCase
  });
});

describe('createPreactTypes', () => {
  it('should generate Preact native types', () => {
    const result = createPreactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'preact'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onMyClick'?:`); // Preact uses camelCase
  });
});

describe('excludeComponents', () => {
  it('should exclude specified components', () => {
    const result = createReactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
      excludeComponents: ['my-button'],
    });

    expect(result).toBe('');
  });
});

describe('generated header', () => {
  it('uses the given import path and shows the exports entry it needs', () => {
    const result = createReactTypes({
      components: [createMockComponent()],
      stencilPackageName: '@acme/ui',
      importPath: 'react-types',
      typesFilePath: 'dist/types/react-types.d.ts',
    });
    expect(result).toContain(`import '@acme/ui/react-types';`);
    expect(result).toContain(`"./react-types": { "types": "./dist/types/react-types.d.ts" }`);
  });

  it('falls back to the default file name and omits the exports hint', () => {
    const result = createReactTypes({ components: [createMockComponent()], stencilPackageName: 'my-package' });
    expect(result).toContain(`import 'my-package/react-native-types';`);
    expect(result).not.toContain('exports');
  });
});

type GeneratorArgs = Parameters<ReturnType<typeof typesOutputTarget>['generator']>;

describe('typesOutputTarget generator', () => {
  const runGenerator = async (options: TypesOutputTargetOptions, pkg: object | null) => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'types-ot-'));
    if (pkg) {
      fs.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify(pkg));
    }
    const written = new Map<string, string>();
    const config = { rootDir, fsNamespace: 'ui', packageJsonFilePath: path.join(rootDir, 'package.json') };
    const compilerCtx = { fs: { writeFile: async (p: string, c: string) => void written.set(p, c) } };
    const buildCtx = {
      components: [createMockComponent()],
      createTimeSpan: () => ({ finish: () => {} }),
    };
    // partial mocks: the generator only touches the fields above
    await typesOutputTarget(options).generator(
      config as unknown as GeneratorArgs[0],
      compilerCtx as unknown as GeneratorArgs[1],
      buildCtx as unknown as GeneratorArgs[2]
    );
    return { rootDir, written };
  };

  it('imports component types from the npm package name, not fsNamespace', async () => {
    const { rootDir, written } = await runGenerator({ reactTypesPath: 'dist/types' }, { name: '@acme/ui' });
    const content = written.get(path.join(rootDir, 'dist/types/react-native-types.d.ts'));
    expect(content).toContain(`from '@acme/ui';`);
    expect(content).toContain(`import '@acme/ui/react-native-types';`);
    expect(content).toContain(`"./react-native-types": { "types": "./dist/types/react-native-types.d.ts" }`);
  });

  it('names a custom output file in the header', async () => {
    const { written } = await runGenerator({ vueTypesPath: 'types/vue.d.ts' }, { name: '@acme/ui' });
    const [content] = written.values();
    expect(content).toContain(`import '@acme/ui/vue';`);
    expect(content).toContain(`"./vue": { "types": "./types/vue.d.ts" }`);
  });

  it('falls back to fsNamespace without a package.json', async () => {
    const { written } = await runGenerator({ reactTypesPath: 'dist/types' }, null);
    const [content] = written.values();
    expect(content).toContain(`from 'ui';`);
  });
});
