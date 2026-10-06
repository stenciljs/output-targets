import path from 'path';
import { fileURLToPath } from 'url';
import type { CompilerCtx, ComponentCompilerMeta, ComponentCompilerProperty, Config } from '@stencil/core/internal';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import type { ComponentInputProperty, OutputTargetAngular, PackageJSON } from './types';
import {
  relativeImport,
  normalizePath,
  sortBy,
  readPackageJson,
  dashToPascalCase,
  createImportStatement,
  isOutputTypeCustomElementsBuild,
  OutputTypes,
  mapPropName,
} from './utils';
import {
  createAngularComponentDefinition,
  createComponentTypeDefinition,
  INPUT_TRANSFORM_FUNCTION,
} from './generate-angular-component';
import { generateAngularDirectivesFile } from './generate-angular-directives-file';
import generateValueAccessors from './generate-value-accessors';
import { generateAngularModuleForComponent } from './generate-angular-modules';
import { generateTransformTagScript } from './generate-transformtag-script';

const filterInternalProps = (prop: { name: string; internal: boolean }) => !prop.internal;

/**
 * Whether a property declares an input transform.
 *
 * This is the single definition of the rule. Both the generated declaration and the import that
 * satisfies it are derived from it, so widening the rule can't leave a generated file referencing
 * a transform it never imports.
 *
 * @param prop The property compiler metadata.
 * @param booleanAttributes Whether boolean properties should declare an input transform.
 * @returns `true` when the property should be transformed.
 */
const isTransformedProp = (prop: { type?: string }, booleanAttributes: boolean) =>
  booleanAttributes && prop.type === 'boolean';

/**
 * Maps a Stencil property to an Angular input declaration.
 *
 * Virtual properties are mapped with `booleanAttributes` left at its default of `false`. They
 * carry a free-form type string and no `required` flag, so they are never transformed and always
 * come out as optional.
 *
 * @param prop The property compiler metadata.
 * @param booleanAttributes Whether boolean properties should declare an input transform.
 * @returns The Angular input declaration.
 */
const mapInputProp = (
  prop: { name: string; required?: boolean; type?: string },
  booleanAttributes = false
): ComponentInputProperty => ({
  name: prop.name,
  required: prop.required ?? false,
  transform: isTransformedProp(prop, booleanAttributes) ? true : undefined,
});

/**
 * Whether any of a component's properties will declare an input transform, which determines
 * whether the transform needs to be imported.
 *
 * @param components The components in the generated file.
 * @param booleanAttributes Whether boolean properties should declare an input transform.
 * @returns `true` when at least one property is transformed.
 */
const usesInputTransform = (components: readonly ComponentCompilerMeta[], booleanAttributes: boolean) =>
  components.some((cmpMeta) =>
    (cmpMeta.properties ?? []).filter(filterInternalProps).some((prop) => isTransformedProp(prop, booleanAttributes))
  );

/**
 * Whether the Stencil project generates a package.json `exports` map. Deep `dist/` imports are
 * blocked for consumers then, so the proxies import through the map's entries instead
 * (`<pkg>/<tag>`, `<pkg>/loader`, `<pkg>/standalone`).
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
function getComponentModule(config: Config, outputTarget: OutputTargetAngular, tagName: string): string {
  const basePkg = normalizePath(outputTarget.componentCorePackage!);
  if (usesExportMaps(config)) {
    return `${basePkg}/${tagName}`;
  }
  return `${basePkg}/${outputTarget.customElementsDir}/${tagName}.js`;
}

/**
 * The relative import of the project's own `components.d.ts`, for when there's no
 * `componentCorePackage`. Only resolved when needed: package.json may have no `types` field.
 */
function getComponentsTypeFile(pkgData: PackageJSON, outputTarget: OutputTargetAngular, rootDir: string): string {
  const dtsFilePath = path.join(rootDir, path.dirname(pkgData.types), GENERATED_DTS);
  return relativeImport(outputTarget.directivesProxyFile, dtsFilePath, '.d.ts');
}

export async function angularDirectiveProxyOutput(
  compilerCtx: CompilerCtx,
  outputTarget: OutputTargetAngular,
  components: ComponentCompilerMeta[],
  config: Config
) {
  const filteredComponents = getFilteredComponents(outputTarget.excludeComponents, components);
  const rootDir = config.rootDir as string;
  const pkgData = await readPackageJson(config, rootDir);

  // esModules defaults to true, but only applies when outputType is 'scam' or 'standalone'
  const isCustomElementsBuild = isOutputTypeCustomElementsBuild(outputTarget.outputType!);
  const useEsModules = isCustomElementsBuild && outputTarget.esModules === true;

  const tasks: Promise<any>[] = [
    copyResources(config, outputTarget),
    generateValueAccessors(compilerCtx, filteredComponents, outputTarget, config),
  ];

  if (useEsModules) {
    // Generate separate files for each component
    const proxiesDir = path.dirname(outputTarget.directivesProxyFile);

    for (const component of filteredComponents) {
      const componentFile = path.join(proxiesDir, `${component.tagName}.ts`);
      const componentText = generateComponentProxy(component, pkgData, outputTarget, rootDir, config);
      tasks.push(compilerCtx.fs.writeFile(componentFile, componentText));
    }

    // Generate barrel file that re-exports all components
    const barrelText = generateBarrelFile(filteredComponents, outputTarget);
    tasks.push(compilerCtx.fs.writeFile(outputTarget.directivesProxyFile, barrelText));

    // Generate DIRECTIVES file (imports from barrel)
    tasks.push(generateAngularDirectivesFile(compilerCtx, filteredComponents, outputTarget));
  } else {
    // Generate single file with all components (original behavior)
    const finalText = generateProxies(filteredComponents, pkgData, outputTarget, rootDir, config);
    tasks.push(compilerCtx.fs.writeFile(outputTarget.directivesProxyFile, finalText));
    tasks.push(generateAngularDirectivesFile(compilerCtx, filteredComponents, outputTarget));
  }

  // Generate transformer script if transformTag is enabled
  if (outputTarget.transformTag) {
    tasks.push(generateTransformTagScript(compilerCtx, filteredComponents, outputTarget, usesExportMaps(config)));
  }

  await Promise.all(tasks);
}

function getFilteredComponents(excludeComponents: string[] = [], cmps: ComponentCompilerMeta[]) {
  return sortBy(cmps, (cmp) => cmp.tagName).filter((c) => !excludeComponents.includes(c.tagName) && !c.internal);
}

async function copyResources(config: Config, outputTarget: OutputTargetAngular) {
  if (!config.sys || !config.sys.copy || !config.sys.glob) {
    throw new Error('stencil is not properly initialized at this step. Notify the developer');
  }
  const srcDirectory = path.join(__dirname, '..', 'angular-component-lib');
  const destDirectory = path.join(path.dirname(outputTarget.directivesProxyFile), 'angular-component-lib');

  return config.sys.copy(
    [
      {
        src: srcDirectory,
        dest: destDirectory,
        keepDirStructure: false,
        warn: false,
        ignore: [],
      },
    ],
    srcDirectory
  );
}

export function generateProxies(
  components: ComponentCompilerMeta[],
  pkgData: PackageJSON,
  outputTarget: OutputTargetAngular,
  rootDir: string,
  config: Config
) {
  const { outputType } = outputTarget;
  const includeSingleComponentAngularModules = outputType === OutputTypes.Scam;
  const isCustomElementsBuild = isOutputTypeCustomElementsBuild(outputType!);
  const isStandaloneBuild = outputType === OutputTypes.Standalone;
  const includeOutputImports = components.some((component) => component.events.some((event) => !event.internal));

  /**
   * The collection of named imports from @angular/core.
   */
  const angularCoreImports = ['ChangeDetectionStrategy', 'ChangeDetectorRef', 'Component', 'ElementRef'];

  if (includeOutputImports) {
    angularCoreImports.push('EventEmitter', 'Output');
  }

  angularCoreImports.push('NgZone');

  /**
   * The collection of named imports from the angular-component-lib/utils.
   */
  const componentLibImports = ['ProxyCmp'];

  /**
   * The input transform lives in its own module so that it carries no runtime imports.
   */
  let transformImport = '';

  const booleanAttributes = outputTarget.booleanAttributes === true;

  if (usesInputTransform(components, booleanAttributes)) {
    transformImport = `\n${createImportStatement([INPUT_TRANSFORM_FUNCTION], './angular-component-lib/boolean-attribute')}`;
  }

  if (includeSingleComponentAngularModules) {
    angularCoreImports.push('NgModule');
  }

  const imports = `/* tslint:disable */
/* auto-generated angular directive proxies */
${createImportStatement(angularCoreImports, '@angular/core')}

${createImportStatement(componentLibImports, './angular-component-lib/utils')}${transformImport}\n`;

  /**
   * Generate JSX import type from correct location.
   * When using custom elements build, we need to import from
   * either the "components" directory or customElementsDir
   * otherwise we risk bundlers pulling in lazy loaded imports.
   */
  const generateTypeImports = () => {
    const importLocation = outputTarget.componentCorePackage
      ? getPathToComponentTypes(config, outputTarget)
      : normalizePath(getComponentsTypeFile(pkgData, outputTarget, rootDir));
    return `import ${isCustomElementsBuild ? 'type ' : ''}{ ${IMPORT_TYPES} } from '${importLocation}';\n`;
  };

  const typeImports = generateTypeImports();

  let sourceImports = '';

  /**
   * Build an array of Custom Elements build imports and namespace them
   * so that they do not conflict with the Angular wrapper names. For example,
   * IonButton would be imported as IonButtonCmp so as to not conflict with the
   * IonButton Angular Component that takes in the Web Component as a parameter.
   */
  if (isCustomElementsBuild && outputTarget.componentCorePackage !== undefined) {
    const cmpImports = components.map((component) => {
      const pascalImport = dashToPascalCase(component.tagName);

      return `import { defineCustomElement as define${pascalImport} } from '${getComponentModule(
        config,
        outputTarget,
        component.tagName
      )}';`;
    });

    sourceImports = cmpImports.join('\n');
  }

  const proxyFileOutput = [];

  const { componentCorePackage, customElementsDir } = outputTarget;

  for (let cmpMeta of components) {
    const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName);

    const internalProps: ComponentCompilerProperty[] = [];

    if (cmpMeta.properties) {
      internalProps.push(...cmpMeta.properties.filter(filterInternalProps));
    }

    const inputs = internalProps.map((prop) => mapInputProp(prop, booleanAttributes));

    if (cmpMeta.virtualProperties) {
      inputs.push(...cmpMeta.virtualProperties.map((prop) => mapInputProp(prop)));
    }

    const orderedInputs = sortBy(inputs, (cip: ComponentInputProperty) => cip.name);

    const methods: string[] = [];

    if (cmpMeta.methods) {
      methods.push(...cmpMeta.methods.filter(filterInternalProps).map(mapPropName));
    }

    const inlineComponentProps = outputTarget.inlineProperties ? internalProps : [];

    /**
     * For each component, we need to generate:
     * 1. The @Component decorated class
     * 2. Optionally the @NgModule decorated class (if includeSingleComponentAngularModules is true)
     * 3. The component interface (using declaration merging for types).
     */
    const componentDefinition = createAngularComponentDefinition(
      cmpMeta.tagName,
      orderedInputs,
      methods,
      isCustomElementsBuild,
      isStandaloneBuild,
      inlineComponentProps,
      cmpMeta.events || []
    );
    const moduleDefinition = generateAngularModuleForComponent(cmpMeta.tagName);
    const componentTypeDefinition = createComponentTypeDefinition(
      outputType!,
      tagNameAsPascal,
      cmpMeta.events,
      componentCorePackage,
      customElementsDir,
      usesExportMaps(config)
    );

    proxyFileOutput.push(componentDefinition, '\n');
    if (includeSingleComponentAngularModules) {
      proxyFileOutput.push(moduleDefinition, '\n');
    }
    proxyFileOutput.push(componentTypeDefinition, '\n');
  }

  const final: string[] = [imports, typeImports, sourceImports, ...proxyFileOutput];

  return final.join('\n') + '\n';
}

/**
 * Generate a single component proxy file for ES modules output
 */
export function generateComponentProxy(
  cmpMeta: ComponentCompilerMeta,
  pkgData: PackageJSON,
  outputTarget: OutputTargetAngular,
  rootDir: string,
  config: Config
) {
  const { outputType, componentCorePackage, customElementsDir } = outputTarget;
  const includeSingleComponentAngularModules = outputType === OutputTypes.Scam;
  const isCustomElementsBuild = isOutputTypeCustomElementsBuild(outputType!);
  const isStandaloneBuild = outputType === OutputTypes.Standalone;

  const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName);
  const hasOutputs = cmpMeta.events?.some((event) => !event.internal);

  // Angular core imports for this component
  const angularCoreImports = ['ChangeDetectionStrategy', 'ChangeDetectorRef', 'Component', 'ElementRef', 'NgZone'];
  if (hasOutputs) {
    angularCoreImports.push('EventEmitter', 'Output');
  }
  if (includeSingleComponentAngularModules) {
    angularCoreImports.push('NgModule');
  }

  const booleanAttributes = outputTarget.booleanAttributes === true;

  const componentLibImports = ['ProxyCmp'];

  // The input transform lives in its own module so that it carries no runtime imports.
  let transformImport = '';
  if (usesInputTransform([cmpMeta], booleanAttributes)) {
    transformImport = `\n${createImportStatement([INPUT_TRANSFORM_FUNCTION], './angular-component-lib/boolean-attribute')}`;
  }

  const imports = `/* tslint:disable */
/* auto-generated angular directive proxies */
${createImportStatement(angularCoreImports, '@angular/core')}

${createImportStatement(componentLibImports, './angular-component-lib/utils')}${transformImport}\n`;

  // Type imports
  const importLocation = componentCorePackage
    ? getPathToComponentTypes(config, outputTarget)
    : normalizePath(getComponentsTypeFile(pkgData, outputTarget, rootDir));
  const typeImports = `import ${isCustomElementsBuild ? 'type ' : ''}{ ${IMPORT_TYPES} } from '${importLocation}';\n`;

  // defineCustomElement import
  let sourceImport = '';
  if (isCustomElementsBuild && componentCorePackage !== undefined) {
    sourceImport = `import { defineCustomElement as define${tagNameAsPascal} } from '${getComponentModule(
      config,
      outputTarget,
      cmpMeta.tagName
    )}';\n`;
  }

  // Generate component definition
  const internalProps: ComponentCompilerProperty[] = [];
  if (cmpMeta.properties) {
    internalProps.push(...cmpMeta.properties.filter(filterInternalProps));
  }

  const inputs = internalProps.map((prop) => mapInputProp(prop, booleanAttributes));
  if (cmpMeta.virtualProperties) {
    inputs.push(...cmpMeta.virtualProperties.map((prop) => mapInputProp(prop)));
  }

  const orderedInputs = sortBy(inputs, (cip: ComponentInputProperty) => cip.name);

  const methods: string[] = [];
  if (cmpMeta.methods) {
    methods.push(...cmpMeta.methods.filter(filterInternalProps).map(mapPropName));
  }

  const inlineComponentProps = outputTarget.inlineProperties ? internalProps : [];

  const componentDefinition = createAngularComponentDefinition(
    cmpMeta.tagName,
    orderedInputs,
    methods,
    isCustomElementsBuild,
    isStandaloneBuild,
    inlineComponentProps,
    cmpMeta.events || []
  );

  const moduleDefinition = generateAngularModuleForComponent(cmpMeta.tagName);

  const componentTypeDefinition = createComponentTypeDefinition(
    outputType!,
    tagNameAsPascal,
    cmpMeta.events,
    componentCorePackage,
    customElementsDir,
    usesExportMaps(config)
  );

  const proxyFileOutput = [componentDefinition, '\n'];
  if (includeSingleComponentAngularModules) {
    proxyFileOutput.push(moduleDefinition, '\n');
  }
  proxyFileOutput.push(componentTypeDefinition, '\n');

  const final: string[] = [imports, typeImports, sourceImport, ...proxyFileOutput];

  return final.join('\n') + '\n';
}

/**
 * Generate a barrel file that re-exports all components
 */
export function generateBarrelFile(components: ComponentCompilerMeta[], outputTarget: OutputTargetAngular) {
  const { outputType } = outputTarget;
  const includeSingleComponentAngularModules = outputType === OutputTypes.Scam;

  const header = `/* tslint:disable */
/**
 * This file was automatically generated by the Stencil Angular Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 */\n\n`;

  const exports = components
    .map((component) => {
      const pascalName = dashToPascalCase(component.tagName);
      const moduleExport = includeSingleComponentAngularModules ? `, ${pascalName}Module` : '';
      return `export { ${pascalName}${moduleExport} } from './${component.tagName}';`;
    })
    .join('\n');

  return header + exports + '\n';
}

export function getPathToComponentTypes(config: Config, outputTarget: OutputTargetAngular): string {
  const basePkg = outputTarget.componentCorePackage || '';

  // The entry of the output the proxies are built on always exports the component types - the
  // package root only does when the project has no `src/index.ts`, or that file re-exports them
  if (usesExportMaps(config)) {
    const entry = isOutputTypeCustomElementsBuild(outputTarget.outputType!) ? 'standalone' : 'loader';
    return `${normalizePath(basePkg)}/${entry}`;
  }

  // in v5, all types (including components.d.ts) are generated in the dist/types directory
  const typesTarget = config.outputTargets?.find((o: any) => o.type === 'types') as any;
  if (typesTarget) {
    const rawDir = typesTarget.dir || 'dist/types';
    const relDir = config.rootDir && path.isAbsolute(rawDir) ? path.relative(config.rootDir as string, rawDir) : rawDir;
    return normalizePath(path.join(basePkg, relDir, 'components'));
  }

  // v4: append customElementsDir for custom elements build, otherwise package root
  const isCustomElementsBuild = isOutputTypeCustomElementsBuild(outputTarget.outputType!);
  if (isCustomElementsBuild && outputTarget.customElementsDir) {
    return normalizePath(path.join(basePkg, outputTarget.customElementsDir));
  }
  return normalizePath(basePkg);
}

const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'Components';
