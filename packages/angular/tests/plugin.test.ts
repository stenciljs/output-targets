import { describe, it, expect } from 'vitest';
import { Config } from '@stencil/core/internal';
import { OutputTargetAngular } from '../src/types';
import { normalizeOutputTarget } from '../src/plugin';

describe('normalizeOutputTarget', () => {
  const config: Config = {
    rootDir: '/dev/',
  };

  it('should return fail if proxiesFile is not set', () => {
    expect(() => {
      normalizeOutputTarget({}, {} as any);
    }).toThrow(new Error('rootDir is not set and it should be set by stencil itself'));
  });

  it('should throw an error if directivesProxyFile is not set', () => {
    expect(() => {
      normalizeOutputTarget(config, {} as any);
    }).toThrow(new Error('directivesProxyFile is required. Please set it in the Stencil config.'));
  });

  it('should return defaults for excludeComponents and valueAccessorConfigs', () => {
    const results: OutputTargetAngular = normalizeOutputTarget(config, {
      directivesProxyFile: '/component-library-angular/src/components.ts',
    } as OutputTargetAngular);

    expect(results.excludeComponents).toEqual([]);
    expect(results.valueAccessorConfigs).toEqual([]);
  });

  it('should return defaults for outputType', () => {
    const results = normalizeOutputTarget(config, { directivesProxyFile: '' } as OutputTargetAngular);

    expect(results.outputType).toEqual('standalone');
  });

  it('should return defaults for customElementsDir', () => {
    const results = normalizeOutputTarget(config, { directivesProxyFile: '' } as OutputTargetAngular);

    expect(results.customElementsDir).toEqual('components');
  });

  it('should throw when lazyDefine is used with outputType component', () => {
    expect(() =>
      normalizeOutputTarget(config, {
        directivesProxyFile: '',
        outputType: 'component',
        lazyDefine: true,
      } as OutputTargetAngular)
    ).toThrow("The 'lazyDefine' option requires outputType 'standalone' or 'scam'.");
  });

  it.each(['standalone', 'scam'] as const)('should accept lazyDefine with outputType %s', (outputType) => {
    const results = normalizeOutputTarget(config, {
      directivesProxyFile: '',
      outputType,
      lazyDefine: true,
    } as OutputTargetAngular);

    expect(results.lazyDefine).toBe(true);
  });
});
