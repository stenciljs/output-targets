import { describe, it, expect } from 'vitest';
import { reactOutputTarget } from './react-output-target';

describe('reactOutputTarget', () => {
  it('should throw an error if the output target dist-custom-elements is not configured', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
    });

    if (validate) {
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
    }
  });

  it('should throw an error if the output target dist-custom-elements is not correctly configured', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
              },
            ],
          } as any,
          []
        )
      ).toThrowError(
        `The 'react-output-target' requires the 'dist-custom-elements' output target to have 'externalRuntime: true' set in its configuration`
      );
    }
  });

  it('should throw an error if the output target dist-hydrate-script is not configured and hydrateModule option is set', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
      hydrateModule: 'dist/hydrate-script',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
                externalRuntime: true,
              },
            ],
          } as any,
          []
        )
      ).toThrowError(
        `The 'react-output-target' requires 'dist-hydrate-script' output target when the 'hydrateModule' option is set. Add { type: 'dist-hydrate-script' }, to the outputTargets config.`
      );
    }
  });

  it('should throw an error if the package.json file cannot be found', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
                externalRuntime: true,
              },
            ],
          } as any,
          []
        )
      ).toThrowError(
        'Unable to find the package name in the package.json file: undefined. Please provide the stencilPackageName manually to the react-output-target output target.'
      );
    }
  });

  it('should not throw an error if the package name is provided', () => {
    const { validate } = reactOutputTarget({
      outDir: 'dist/components',
      stencilPackageName: 'my-components',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
                externalRuntime: true,
              },
            ],
          } as any,
          []
        )
      ).not.toThrowError();
    }
  });

  it('should throw an error if the outDir option is not provided', () => {
    const { validate } = reactOutputTarget({
      stencilPackageName: 'my-components',
    } as any);

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
                externalRuntime: true,
              },
            ],
          } as any,
          []
        )
      ).toThrowError(`The 'outDir' option is required.`);
    }
  });
});
