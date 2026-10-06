import { describe, it, expect } from 'vitest';
import { reactOutputTarget } from './index.js';

describe('reactOutputTarget', () => {
  it('should throw an error if the output target dist-custom-elements is not configured', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
    });

    if (!validate) {
      throw new Error('validate is not defined');
    }

    expect(() =>
      validate(
        {
          outputTargets: [],
        } as any,
        []
      )
    ).toThrowError(
      `The 'react-output-target' requires 'dist-custom-elements' output target. Add { type: 'dist-custom-elements' }, to the outputTargets config.`
    );
  });

  it('should throw an error if the output target dist-custom-elements is not correctly configured', () => {
    const { validate } = reactOutputTarget({
      stencilPackageName: 'my-components',
      outDir: 'dist/components',
      hydrateModule: 'my-components/hydrate',
    });

    if (!validate) {
      throw new Error('validate is not defined');
    }

    expect(() =>
      validate(
        {
          outputTargets: [
            {
              type: 'dist-custom-elements',
              externalRuntime: true,
            },
            {
              type: 'dist-hydrate-script',
              dir: '/hydrate',
            },
          ],
        } as any,
        []
      )
    ).toThrowError(
      `The 'react-output-target' requires the 'dist-custom-elements' output target to have 'externalRuntime: false' set in its configuration`
    );

    expect(() =>
      validate(
        {
          outputTargets: [
            {
              type: 'dist-custom-elements',
            },
            {
              type: 'dist-hydrate-script',
              dir: '/hydrate',
            },
          ],
        } as any,
        []
      )
    ).toThrowError(
      `The 'react-output-target' requires the 'dist-custom-elements' output target to have 'externalRuntime: false' set in its configuration`
    );
  });

  it('should throw an error if the output target dist-hydrate-script is not configured and hydrateModule option is set', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
      hydrateModule: 'dist/hydrate-script',
    });

    if (!validate) {
      throw new Error('validate is not defined');
    }

    expect(() =>
      validate(
        {
          outputTargets: [
            {
              type: 'dist-custom-elements',
              externalRuntime: false,
            },
          ],
        } as any,
        []
      )
    ).toThrowError(
      `The 'react-output-target' requires 'dist-hydrate-script' output target when the 'hydrateModule' option is set. Add { type: 'dist-hydrate-script' }, to the outputTargets config.`
    );
  });

  it('should throw an error if the package.json file cannot be found', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
    });

    if (!validate) {
      throw new Error('validate is not defined');
    }

    expect(() =>
      validate(
        {
          outputTargets: [
            {
              type: 'dist-custom-elements',
              externalRuntime: false,
            },
          ],
        } as any,
        []
      )
    ).toThrowError(
      'Unable to find the package name in the package.json file: undefined. Please provide the stencilPackageName manually to the react-output-target output target.'
    );
  });

  it('should not throw an error if the package name is provided', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
      stencilPackageName: 'my-components',
    });

    if (!validate) {
      throw new Error('validate is not defined');
    }

    expect(() =>
      validate(
        {
          outputTargets: [
            {
              type: 'dist-custom-elements',
              externalRuntime: false,
            },
          ],
        } as any,
        []
      )
    ).not.toThrowError();
  });

  it('uses the customElementsDir provided by the caller instead of the calculated value', () => {
    const { validate, __internal_getCustomElementsDir } = reactOutputTarget({
      outDir: 'dist/components',
      stencilPackageName: 'my-components',
      customElementsDir: 'my-custom-dir',
    });

    if (validate) {
      const config = {
        outputTargets: [
          {
            type: 'dist-custom-elements',
            dir: 'my-components',
            externalRuntime: false,
          },
        ],
      } as any;

      validate(config, []);

      expect(__internal_getCustomElementsDir()).toBe('my-custom-dir');
    }
  });

  describe('export maps', () => {
    const run = async (config: Record<string, unknown>) => {
      const target = reactOutputTarget({ outDir: 'out', stencilPackageName: 'my-components' });
      target.validate!(config as any, []);
      const written: Record<string, string> = {};
      await target.generator(
        config as any,
        { fs: { writeFile: async (file: string, text: string) => void (written[file] = text) } } as any,
        {
          components: [{ tagName: 'my-button', componentClassName: 'MyButton', properties: [], events: [] }],
          createTimeSpan: () => ({ finish: () => {} }),
        } as any,
        {} as any
      );
      return Object.values(written).join('\n');
    };

    it('imports through the exports map for a Stencil v5 project with generateExportMaps', async () => {
      const output = await run({ rootDir: '/', generateExportMaps: true, outputTargets: [{ type: 'standalone' }] });
      expect(output).toContain('from "my-components/my-button"');
      expect(output).toContain('import type { Components } from "my-components/standalone"');
    });

    it('keeps deep paths for a Stencil v4 project, even with generateExportMaps', async () => {
      const output = await run({
        rootDir: '/',
        generateExportMaps: true,
        outputTargets: [{ type: 'dist-custom-elements', externalRuntime: false }],
      });
      expect(output).toContain('from "my-components/dist/components/my-button.js"');
      expect(output).not.toContain('from "my-components/my-button"');
    });
  });
});
