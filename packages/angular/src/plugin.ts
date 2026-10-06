import type { Config } from '@stencil/core';
import { OutputTypes, normalizePath } from './utils';
import { angularDirectiveProxyOutput } from './output-angular';
import type { OutputTargetAngular } from './types';
import path from 'path';

// Stencil v5 removed the `@stencil/core/internal` entry point, so anything that ends up in
// our public typings is derived from the root `Config` type, which v4 and v5 both export.
type OutputTargetCustom = Extract<NonNullable<Config['outputTargets']>[number], { type: 'custom' }>;
type PluginConfig = Parameters<OutputTargetCustom['generator']>[0];

export const angularOutputTarget = (outputTarget: OutputTargetAngular): OutputTargetCustom => {
  let validatedOutputTarget: OutputTargetAngular;

  return {
    type: 'custom',
    name: 'angular-library',
    validate(config) {
      validatedOutputTarget = normalizeOutputTarget(config, outputTarget);
    },
    async generator(config, compilerCtx, buildCtx) {
      const timespan = buildCtx.createTimeSpan(`generate angular proxies started`, true);

      await angularDirectiveProxyOutput(compilerCtx, validatedOutputTarget, buildCtx.components, config);

      timespan.finish(`generate angular proxies finished`);
    },
  };
};

export function normalizeOutputTarget(config: PluginConfig, outputTarget: OutputTargetAngular) {
  const results: OutputTargetAngular = {
    ...outputTarget,
    excludeComponents: outputTarget.excludeComponents || [],
    valueAccessorConfigs: outputTarget.valueAccessorConfigs || [],
    customElementsDir: outputTarget.customElementsDir ?? 'components',
    outputType: outputTarget.outputType ?? OutputTypes.Standalone,
  };

  if (config.rootDir == null) {
    throw new Error('rootDir is not set and it should be set by stencil itself');
  }

  if (outputTarget.directivesProxyFile == null) {
    throw new Error('directivesProxyFile is required. Please set it in the Stencil config.');
  }

  if (outputTarget.directivesProxyFile && !path.isAbsolute(outputTarget.directivesProxyFile)) {
    results.directivesProxyFile = normalizePath(path.join(config.rootDir, outputTarget.directivesProxyFile));
  }

  if (outputTarget.directivesArrayFile && !path.isAbsolute(outputTarget.directivesArrayFile)) {
    results.directivesArrayFile = normalizePath(path.join(config.rootDir, outputTarget.directivesArrayFile));
  }

  if ((outputTarget as any).includeSingleComponentAngularModules !== undefined) {
    throw new Error(
      "The 'includeSingleComponentAngularModules' option has been removed. Please use 'outputType' instead."
    );
  }

  return results;
}
