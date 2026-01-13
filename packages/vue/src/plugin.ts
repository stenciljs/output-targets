import type { Config, OutputTargetCustom } from '@stencil/core/internal';
import { normalizePath } from './utils';
import type { OutputTargetVue } from './types';
import { vueProxyOutput } from './output-vue';
import { createTagTransformer } from './create-tag-transformer';
import path from 'path';

export const vueOutputTarget = (outputTarget: OutputTargetVue): OutputTargetCustom => ({
  type: 'custom',
  name: 'vue-library',
  validate(config) {
    return normalizeOutputTarget(config, outputTarget);
  },
  async generator(config, compilerCtx, buildCtx) {
    const timespan = buildCtx.createTimeSpan(`generate vue started`, true);

    await vueProxyOutput(config, compilerCtx, outputTarget, buildCtx.components);

    // Generate tag-transformer.ts if transformTag is enabled
    if (outputTarget.transformTag && outputTarget.componentCorePackage) {
      const customElementsDir = outputTarget.customElementsDir || 'components';

      const tagTransformerContent = createTagTransformer({
        stencilPackageName: outputTarget.componentCorePackage,
        customElementsDir,
      });

      const proxiesDir = path.dirname(outputTarget.proxiesFile);
      const tagTransformerPath = path.join(proxiesDir, 'tag-transformer.ts');
      await compilerCtx.fs.writeFile(tagTransformerPath, tagTransformerContent);
    }

    timespan.finish(`generate vue finished`);
  },
});

export function normalizeOutputTarget(config: Config, outputTarget: any) {
  const results: OutputTargetVue = {
    ...outputTarget,
    excludeComponents: outputTarget.excludeComponents || [],
    componentModels: outputTarget.componentModels || [],
    includePolyfills: outputTarget.includePolyfills ?? true,
    includeDefineCustomElements: outputTarget.includeDefineCustomElements ?? true,
  };

  if (config.rootDir == null) {
    throw new Error('rootDir is not set and it should be set by stencil itself');
  }
  if (outputTarget.proxiesFile == null) {
    throw new Error('proxiesFile is required');
  }
  if (outputTarget.includeDefineCustomElements && outputTarget.includeImportCustomElements) {
    throw new Error(
      'includeDefineCustomElements cannot be used at the same time as includeImportCustomElements since includeDefineCustomElements is used for lazy loading components. Set `includeDefineCustomElements: false` in your Vue output target config to resolve this.'
    );
  }
  if (
    typeof outputTarget.includeDefineCustomElements === 'boolean' &&
    !outputTarget.includeDefineCustomElements &&
    typeof outputTarget.includeImportCustomElements === 'boolean' &&
    !outputTarget.includeImportCustomElements
  ) {
    throw new Error(
      '`includeDefineCustomElements` and `includeImportCustomElements` cannot both be set to `false`!\n\n' +
        'Enable one of the options depending whether you would like to lazy load the Stencil components (includeDefineCustomElements: true) or ' +
        'include all component code within your application bundle and have the bundler lazy load the chunks (includeImportCustomElements: true).'
    );
  }

  if (outputTarget.includeImportCustomElements && outputTarget.includePolyfills) {
    throw new Error(
      'includePolyfills cannot be used at the same time as includeImportCustomElements. Set `includePolyfills: false` in your Vue output target config to resolve this.'
    );
  }

  if (outputTarget.directivesProxyFile && !path.isAbsolute(outputTarget.directivesProxyFile)) {
    results.proxiesFile = normalizePath(path.join(config.rootDir, outputTarget.proxiesFile));
  }

  return results;
}
