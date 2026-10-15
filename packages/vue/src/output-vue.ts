import path from 'path';
import type { OutputTargetVue, PackageJSON } from './types';
import type { CompilerCtx, ComponentCompilerMeta, Config, OutputTargetDist } from '@stencil/core/internal';
import { createComponentDefinition } from './generate-vue-component';
import { normalizePath, readPackageJson, relativeImport, sortBy, dashToPascalCase } from './utils';

export async function vueProxyOutput(
  config: Config,
  compilerCtx: CompilerCtx,
  outputTarget: OutputTargetVue,
  components: ComponentCompilerMeta[]
) {
  const filteredComponents = getFilteredComponents(outputTarget.excludeComponents, components);
  const rootDir = config.rootDir as string;
  const pkgData = await readPackageJson(rootDir);

  // esModules defaults to true, but only applies when includeImportCustomElements is true
  const useEsModules = outputTarget.includeImportCustomElements && outputTarget.esModules === true;

  if (useEsModules) {
    // Generate separate files for each component
    const proxiesDir = path.dirname(outputTarget.proxiesFile);

    for (const component of filteredComponents) {
      const componentFile = path.join(proxiesDir, `${component.tagName}.ts`);
      const componentText = generateComponentProxy(config, component, pkgData, outputTarget, rootDir);
      await compilerCtx.fs.writeFile(componentFile, componentText);
    }

    // Generate barrel file that re-exports all components
    const barrelText = generateBarrelFile(filteredComponents);
    await compilerCtx.fs.writeFile(outputTarget.proxiesFile, barrelText);
  } else {
    // Generate single file with all components (original behavior)
    const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir);
    await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText);
  }
}

/**
 * Whether the Stencil project generates a package.json `exports` map. Deep `dist/` imports are
 * blocked for consumers then, so the proxies import through the map's entries instead
 * (`<pkg>/<tag>`, `<pkg>/components`, `<pkg>/loader`, `<pkg>/standalone`).
 */
export function usesExportMaps(config: Config): boolean {
  // Stencil v5 only: v4's map has no `./standalone` entry, and its root types aren't
  // guaranteed to export the component types.
  const isV5 = (config.outputTargets || []).some((o: any) =>
    ['loader-bundle', 'standalone', 'ssr', 'types'].includes(o.type)
  );
  return isV5 && (config as { generateExportMaps?: boolean }).generateExportMaps === true;
}

/**
 * The module specifier a proxy imports a component's `defineCustomElement` from.
 */
function getComponentModule(config: Config, outputTarget: OutputTargetVue, tagName: string): string {
  const basePkg = normalizePath(outputTarget.componentCorePackage!);
  if (usesExportMaps(config)) {
    return `${basePkg}/${tagName}`;
  }
  return `${basePkg}/${outputTarget.customElementsDir || 'components'}/${tagName}.js`;
}

function getFilteredComponents(excludeComponents: string[] = [], cmps: ComponentCompilerMeta[]) {
  return sortBy<ComponentCompilerMeta>(cmps, (cmp: ComponentCompilerMeta) => cmp.tagName).filter(
    (c: ComponentCompilerMeta) => !excludeComponents.includes(c.tagName) && !c.internal
  );
}

export function generateProxies(
  config: Config,
  components: ComponentCompilerMeta[],
  pkgData: PackageJSON,
  outputTarget: OutputTargetVue,
  rootDir: string
) {
  const pathToCorePackageLoader = getPathToCorePackageLoader(config, outputTarget);
  const importKeys = [
    'defineContainer',
    typeof outputTarget.hydrateModule === 'string' ? 'defineStencilSSRComponent' : undefined,
    'type StencilVueComponent',
  ].filter(Boolean);

  const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { ${importKeys.join(', ')} } from '@stencil/vue-output-target/runtime';\n`;

  const generateTypeImports = () => {
    if (outputTarget.componentCorePackage !== undefined) {
      return `import type { ${IMPORT_TYPES} } from '${normalizePath(getPathToJSXTypes(config, outputTarget))}';\n`;
    }

    // Only needed without a componentCorePackage - package.json may have no `types` otherwise
    const distTypesDir = path.dirname(pkgData.types);
    const dtsFilePath = path.join(rootDir, distTypesDir, GENERATED_DTS);
    const componentsTypeFile = relativeImport(outputTarget.proxiesFile, dtsFilePath, '.d.ts');
    return `import type { ${IMPORT_TYPES} } from '${normalizePath(componentsTypeFile)}';\n`;
  };

  const typeImports = generateTypeImports();

  let sourceImports = '';
  let registerCustomElements = '';

  if (outputTarget.includeImportCustomElements && outputTarget.componentCorePackage !== undefined) {
    const cmpImports = components.map((component) => {
      const pascalImport = dashToPascalCase(component.tagName);

      return `import { defineCustomElement as define${pascalImport} } from '${getComponentModule(
        config,
        outputTarget,
        component.tagName
      )}';`;
    });

    sourceImports = cmpImports.join('\n');
  } else if (outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${APPLY_POLYFILLS}, ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
    registerCustomElements = `${APPLY_POLYFILLS}().then(() => ${REGISTER_CUSTOM_ELEMENTS}());`;
  } else if (!outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
    registerCustomElements = `${REGISTER_CUSTOM_ELEMENTS}();`;
  }

  // Add transformTag import if enabled
  // Import from the local tag-transformer file which syncs with Stencil's runtime
  let transformTagImport = '';
  if (outputTarget.transformTag && outputTarget.componentCorePackage) {
    // Always import from tag-transformer.ts (both client and SSR use it)
    transformTagImport = `import { transformTag, getTagTransformer } from './tag-transformer.js';\n`;
  }

  // Don't re-export transformTag utilities from main index
  // Users should import from component-library-vue/tag-transformer instead
  // to set the transformer before importing components
  let reExports = '';

  const final: string[] = [
    imports,
    typeImports,
    sourceImports,
    transformTagImport,
    registerCustomElements,
    components.map(createComponentDefinition(IMPORT_TYPES, outputTarget)).join('\n'),
    reExports,
  ];

  return final.join('\n') + '\n';
}

/**
 * Generate a single component proxy file for ES modules output
 */
export function generateComponentProxy(
  config: Config,
  component: ComponentCompilerMeta,
  _pkgData: PackageJSON,
  outputTarget: OutputTargetVue,
  _rootDir: string
) {
  const pascalImport = dashToPascalCase(component.tagName);
  const importKeys = [
    'defineContainer',
    typeof outputTarget.hydrateModule === 'string' ? 'defineStencilSSRComponent' : undefined,
    'type StencilVueComponent',
  ].filter(Boolean);

  const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { ${importKeys.join(', ')} } from '@stencil/vue-output-target/runtime';\n`;

  const typeImports = `import type { ${IMPORT_TYPES} } from '${getPathToJSXTypes(config, outputTarget)}';\n`;

  const sourceImport = `import { defineCustomElement as define${pascalImport} } from '${getComponentModule(
    config,
    outputTarget,
    component.tagName
  )}';\n`;

  // Add transformTag import if enabled
  let transformTagImport = '';
  if (outputTarget.transformTag && outputTarget.componentCorePackage) {
    transformTagImport = `import { transformTag, getTagTransformer } from './tag-transformer.js';\n`;
  }

  const componentDefinition = createComponentDefinition(IMPORT_TYPES, outputTarget)(component);

  const final: string[] = [imports, typeImports, sourceImport, transformTagImport, componentDefinition];

  return final.join('\n') + '\n';
}

/**
 * Generate a barrel file that re-exports all components
 */
export function generateBarrelFile(components: ComponentCompilerMeta[]) {
  const header = `/* eslint-disable */
/* tslint:disable */
/**
 * This file was automatically generated by the Stencil Vue Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */\n\n`;

  const exports = components
    .map((component) => {
      const pascalName = dashToPascalCase(component.tagName);
      return `export { ${pascalName} } from './${component.tagName}.js';`;
    })
    .join('\n');

  return header + exports + '\n';
}

export function getPathToCorePackageLoader(config: Config, outputTarget: OutputTargetVue) {
  const basePkg = outputTarget.componentCorePackage || '';

  if (outputTarget.loaderDir) {
    return normalizePath(path.join(basePkg, outputTarget.loaderDir));
  }

  if (usesExportMaps(config)) {
    return normalizePath(`${basePkg}/loader`);
  }

  // v5: loader-bundle (replaces dist)
  const loaderBundleTarget = config.outputTargets?.find((o: any) => o.type === 'loader-bundle') as any;
  if (loaderBundleTarget) {
    const rawDir = loaderBundleTarget.dir || 'dist/loader-bundle';
    const relDir = config.rootDir && path.isAbsolute(rawDir) ? path.relative(config.rootDir, rawDir) : rawDir;
    const loaderPath = loaderBundleTarget.loaderPath || 'loader';
    return normalizePath(path.join(basePkg, relDir, loaderPath));
  }

  // v4: dist
  const distTarget = config.outputTargets?.find((o: any) => o.type === 'dist') as OutputTargetDist;
  if (distTarget) {
    const absEsmLoaderPath =
      distTarget.esmLoaderPath && path.isAbsolute(distTarget.esmLoaderPath) ? distTarget.esmLoaderPath : null;
    const relEsmLoaderPath =
      config.rootDir && absEsmLoaderPath ? path.relative(config.rootDir, absEsmLoaderPath) : null;
    if (relEsmLoaderPath) {
      return normalizePath(path.join(basePkg, relEsmLoaderPath));
    }
  }

  const isV5 = config.outputTargets?.some((o: any) => ['loader-bundle', 'standalone', 'ssr', 'types'].includes(o.type));
  const defaultLoaderDir = isV5 ? DEFAULT_LOADER_DIR_V5 : DEFAULT_LOADER_DIR_V4;
  return normalizePath(path.join(basePkg, defaultLoaderDir));
}

export function getPathToJSXTypes(config: Config, outputTarget: OutputTargetVue): string {
  const basePkg = outputTarget.componentCorePackage || '';

  // `components.d.ts` holds every component type, whichever output the proxies are built on
  // and whatever a `src/index.ts` re-exports. With an exports map it's `<pkg>/components`.
  if (usesExportMaps(config)) {
    return `${normalizePath(basePkg)}/components`;
  }

  // v5: types output target
  const typesTarget = config.outputTargets?.find((o: any) => o.type === 'types') as any;
  if (typesTarget) {
    const rawDir = typesTarget.dir || 'dist/types';
    const relDir = config.rootDir && path.isAbsolute(rawDir) ? path.relative(config.rootDir, rawDir) : rawDir;
    return normalizePath(path.join(basePkg, relDir, 'components'));
  }

  // v4 'dist-custom-elements': append customElementsDir
  if (outputTarget.includeImportCustomElements && outputTarget.customElementsDir) {
    return normalizePath(path.join(basePkg, outputTarget.customElementsDir));
  }

  // v4 lazy: package root
  return normalizePath(basePkg);
}

export const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'JSX';
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements';
const APPLY_POLYFILLS = 'applyPolyfills';
const DEFAULT_LOADER_DIR_V4 = '/dist/loader';
const DEFAULT_LOADER_DIR_V5 = '/dist/loader-bundle/loader';
