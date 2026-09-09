import { describe, it, expect } from 'vitest';

import { type Config } from '@stencil/core/internal';
import { OutputTargetVue } from './types';
import { normalizeOutputTarget } from './plugin';

describe('normalizeOutputTarget', () => {
  const config: Config = {
    rootDir: '/dev/',
  };

  it('should return fail if proxiesFile is not set', () => {
    expect(() => {
      normalizeOutputTarget({}, {});
    }).toThrow(new Error('rootDir is not set and it should be set by stencil itself'));
  });

  it('should return fail if proxiesFile is not set', () => {
    expect(() => {
      normalizeOutputTarget(config, {});
    }).toThrow(new Error('proxiesFile is required'));
  });

  it('should return fail if proxiesFile is not set', () => {
    expect(() => {
      normalizeOutputTarget(config, {
        includeDefineCustomElements: false,
        includeImportCustomElements: false,
        proxiesFile: '../component-library-vue/src/components.ts',
      });
    }).toThrow(expect.objectContaining({ message: expect.stringContaining('cannot both be set to `false`') }));
  });

  it('should return defaults for excludedComponents, includePolyfills, and includeDefineCustomElements', () => {
    const results: OutputTargetVue = normalizeOutputTarget(config, {
      proxiesFile: '../component-library-vue/src/components.ts',
    });

    expect(results).toEqual({
      proxiesFile: '../component-library-vue/src/components.ts',
      excludeComponents: [],
      componentModels: [],
      includePolyfills: true,
      includeDefineCustomElements: true,
    } as OutputTargetVue);
  });

  it('Polyfills and DefinCustomElements should be false when set that way', () => {
    const results: OutputTargetVue = normalizeOutputTarget(config, {
      proxiesFile: '../component-library-vue/src/components.ts',
      includePolyfills: false,
      includeDefineCustomElements: false,
    });

    expect(results.includeDefineCustomElements).toEqual(false);
    expect(results.includeDefineCustomElements).toEqual(false);
  });

  it('Polyfills and DefinCustomElements should be true when set that way', () => {
    const results: OutputTargetVue = normalizeOutputTarget(config, {
      proxiesFile: '../component-library-vue/src/components.ts',
      includePolyfills: true,
      includeDefineCustomElements: true,
    });

    expect(results.includeDefineCustomElements).toEqual(true);
    expect(results.includeDefineCustomElements).toEqual(true);
  });
});
