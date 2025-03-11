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

  const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir);
  await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText);
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
  const distTypesDir = path.dirname(pkgData.types);
  const dtsFilePath = path.join(rootDir, distTypesDir, GENERATED_DTS);
  const componentsTypeFile = relativeImport(outputTarget.proxiesFile, dtsFilePath, '.d.ts');
  const pathToCorePackageLoader = getPathToCorePackageLoader(config, outputTarget);
  const importKeys = [
    'defineContainer',
    typeof outputTarget.hydrateModule === 'string' ? 'defineStencilSSRComponent' : undefined,
    'type StencilVueComponent'
  ].filter(Boolean);

  const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { ${importKeys.join(', ')} } from '@stencil/vue-output-target/runtime';\n`;

  const generateTypeImports = () => {
    if (outputTarget.componentCorePackage !== undefined) {
      const dirPath =
        outputTarget.includeImportCustomElements && outputTarget.customElementsDir
          ? `/${outputTarget.customElementsDir}`
          : '';
      return `import type { ${IMPORT_TYPES} } from '${normalizePath(outputTarget.componentCorePackage)}${dirPath}';\n`;
    }

    return `import type { ${IMPORT_TYPES} } from '${normalizePath(componentsTypeFile)}';\n`;
  };

  const typeImports = generateTypeImports();

  let sourceImports = '';
  let registerCustomElements = '';

  if (outputTarget.includeImportCustomElements && outputTarget.componentCorePackage !== undefined) {
    const cmpImports = components.map((component) => {
      const pascalImport = dashToPascalCase(component.tagName);

      return `import { defineCustomElement as define${pascalImport} } from '${normalizePath(
        outputTarget.componentCorePackage!
      )}/${outputTarget.customElementsDir || 'components'}/${component.tagName}.js';`;
    });

    sourceImports = cmpImports.join('\n');
  } else if (outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${APPLY_POLYFILLS}, ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
    registerCustomElements = `${APPLY_POLYFILLS}().then(() => ${REGISTER_CUSTOM_ELEMENTS}());`;
  } else if (!outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
    registerCustomElements = `${REGISTER_CUSTOM_ELEMENTS}();`;
  }

  const final: string[] = [
    imports,
    typeImports,
    sourceImports,
    registerCustomElements,
    components.map(createComponentDefinition(IMPORT_TYPES, outputTarget)).join('\n'),
  ];

  return final.join('\n') + '\n';
}

export function getPathToCorePackageLoader(config: Config, outputTarget: OutputTargetVue) {
  const basePkg = outputTarget.componentCorePackage || '';
  const distOutputTarget = config.outputTargets?.find((o) => o.type === 'dist') as OutputTargetDist;

  const distAbsEsmLoaderPath =
    distOutputTarget?.esmLoaderPath && path.isAbsolute(distOutputTarget.esmLoaderPath)
      ? distOutputTarget.esmLoaderPath
      : null;

  const distRelEsmLoaderPath =
    config.rootDir && distAbsEsmLoaderPath ? path.relative(config.rootDir, distAbsEsmLoaderPath) : null;

  const loaderDir = outputTarget.loaderDir || distRelEsmLoaderPath || DEFAULT_LOADER_DIR;
  return normalizePath(path.join(basePkg, loaderDir));
}

export const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'JSX';
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements';
const APPLY_POLYFILLS = 'applyPolyfills';
const DEFAULT_LOADER_DIR = '/dist/loader';
