import path from 'path';
import type { CompilerCtx, ComponentCompilerMeta, ComponentCompilerProperty, Config } from '@stencil/core/internal';
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
import { createAngularComponentDefinition, createComponentTypeDefinition } from './generate-angular-component';
import { generateAngularDirectivesFile } from './generate-angular-directives-file';
import generateValueAccessors from './generate-value-accessors';
import { generateAngularModuleForComponent } from './generate-angular-modules';
import { generateTransformTagScript } from './generate-transformtag-script';

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
      const componentText = generateComponentProxy(component, pkgData, outputTarget, rootDir);
      tasks.push(compilerCtx.fs.writeFile(componentFile, componentText));
    }

    // Generate barrel file that re-exports all components
    const barrelText = generateBarrelFile(filteredComponents, outputTarget);
    tasks.push(compilerCtx.fs.writeFile(outputTarget.directivesProxyFile, barrelText));

    // Generate DIRECTIVES file (imports from barrel)
    tasks.push(generateAngularDirectivesFile(compilerCtx, filteredComponents, outputTarget));
  } else {
    // Generate single file with all components (original behavior)
    const finalText = generateProxies(filteredComponents, pkgData, outputTarget, rootDir);
    tasks.push(compilerCtx.fs.writeFile(outputTarget.directivesProxyFile, finalText));
    tasks.push(generateAngularDirectivesFile(compilerCtx, filteredComponents, outputTarget));
  }

  // Generate transformer script if transformTag is enabled
  if (outputTarget.transformTag) {
    // Read the Angular library's package.json to get its name
    // directivesProxyFile is like: projects/library/src/directives/proxies.ts
    // We need to go up to: projects/library/package.json
    const angularLibraryDir = path.dirname(path.dirname(path.dirname(outputTarget.directivesProxyFile)));
    const angularPkgJsonPath = path.join(angularLibraryDir, 'package.json');
    let angularPackageName = '';

    try {
      const angularPkgJson = JSON.parse(await compilerCtx.fs.readFile(angularPkgJsonPath));
      if (angularPkgJson.name) {
        angularPackageName = angularPkgJson.name;
      }
    } catch (e) {
      throw new Error(
        `Could not read Angular library package.json at ${angularPkgJsonPath}. ` +
          `The package name is required to generate the transformTag patch script.`
      );
    }

    if (!angularPackageName) {
      throw new Error(
        `Angular library package.json at ${angularPkgJsonPath} does not have a "name" field. ` +
          `The package name is required to generate the transformTag patch script.`
      );
    }

    tasks.push(generateTransformTagScript(compilerCtx, filteredComponents, outputTarget, angularPackageName));
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
  rootDir: string
) {
  const distTypesDir = path.dirname(pkgData.types);
  const dtsFilePath = path.join(rootDir, distTypesDir, GENERATED_DTS);
  const { outputType } = outputTarget;
  const componentsTypeFile = relativeImport(outputTarget.directivesProxyFile, dtsFilePath, '.d.ts');
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

  if (includeSingleComponentAngularModules) {
    angularCoreImports.push('NgModule');
  }

  const imports = `/* tslint:disable */
/* auto-generated angular directive proxies */
${createImportStatement(angularCoreImports, '@angular/core')}

${createImportStatement(componentLibImports, './angular-component-lib/utils')}\n`;
  /**
   * Generate JSX import type from correct location.
   * When using custom elements build, we need to import from
   * either the "components" directory or customElementsDir
   * otherwise we risk bundlers pulling in lazy loaded imports.
   */
  const generateTypeImports = () => {
    let importLocation = outputTarget.componentCorePackage
      ? normalizePath(outputTarget.componentCorePackage)
      : normalizePath(componentsTypeFile);
    importLocation += isCustomElementsBuild ? `/${outputTarget.customElementsDir}` : '';
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

      return `import { defineCustomElement as define${pascalImport} } from '${normalizePath(
        outputTarget.componentCorePackage
      )}/${outputTarget.customElementsDir}/${component.tagName}.js';`;
    });

    sourceImports = cmpImports.join('\n');
  }

  const proxyFileOutput = [];

  const filterInternalProps = (prop: { name: string; internal: boolean }) => !prop.internal;

  // Ensure that virtual properties has required as false.
  const mapInputProp = (prop: { name: string; required?: boolean }) => ({
    name: prop.name,
    required: prop.required ?? false,
  });

  const { componentCorePackage, customElementsDir } = outputTarget;

  for (let cmpMeta of components) {
    const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName);

    const internalProps: ComponentCompilerProperty[] = [];

    if (cmpMeta.properties) {
      internalProps.push(...cmpMeta.properties.filter(filterInternalProps));
    }

    const inputs = internalProps.map(mapInputProp);

    if (cmpMeta.virtualProperties) {
      inputs.push(...cmpMeta.virtualProperties.map(mapInputProp));
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
      customElementsDir
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
  rootDir: string
) {
  const { outputType, componentCorePackage, customElementsDir } = outputTarget;
  const distTypesDir = path.dirname(pkgData.types);
  const dtsFilePath = path.join(rootDir, distTypesDir, GENERATED_DTS);
  const componentsTypeFile = relativeImport(outputTarget.directivesProxyFile, dtsFilePath, '.d.ts');
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

  const imports = `/* tslint:disable */
/* auto-generated angular directive proxies */
${createImportStatement(angularCoreImports, '@angular/core')}

${createImportStatement(['ProxyCmp'], './angular-component-lib/utils')}\n`;

  // Type imports
  let importLocation = componentCorePackage
    ? normalizePath(componentCorePackage)
    : normalizePath(componentsTypeFile);
  importLocation += isCustomElementsBuild ? `/${customElementsDir}` : '';
  const typeImports = `import ${isCustomElementsBuild ? 'type ' : ''}{ ${IMPORT_TYPES} } from '${importLocation}';\n`;

  // defineCustomElement import
  let sourceImport = '';
  if (isCustomElementsBuild && componentCorePackage !== undefined) {
    sourceImport = `import { defineCustomElement as define${tagNameAsPascal} } from '${normalizePath(
      componentCorePackage
    )}/${customElementsDir}/${cmpMeta.tagName}.js';\n`;
  }

  // Generate component definition
  const filterInternalProps = (prop: { name: string; internal: boolean }) => !prop.internal;
  const mapInputProp = (prop: { name: string; required?: boolean }) => ({
    name: prop.name,
    required: prop.required ?? false,
  });

  const internalProps: ComponentCompilerProperty[] = [];
  if (cmpMeta.properties) {
    internalProps.push(...cmpMeta.properties.filter(filterInternalProps));
  }

  const inputs = internalProps.map(mapInputProp);
  if (cmpMeta.virtualProperties) {
    inputs.push(...cmpMeta.virtualProperties.map(mapInputProp));
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
    customElementsDir
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
      return `export { ${pascalName}${moduleExport} } from './${component.tagName}.js';`;
    })
    .join('\n');

  return header + exports + '\n';
}

const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'Components';
