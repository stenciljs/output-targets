import { EOL } from 'os';
import path from 'path';
import { OutputTargetAngular, OutputType, ValueAccessorTypes } from './types';
import type { CompilerCtx, ComponentCompilerMeta, Config } from '@stencil/core/internal';
import { OutputTypes } from './utils';

export interface ValueAccessor {
  elementSelectors: string[];
  eventTargets: [string, string][];
}

type NormalizedValueAccessors = {
  [T in ValueAccessorTypes]: ValueAccessor;
};

export default async function generateValueAccessors(
  compilerCtx: CompilerCtx,
  components: ComponentCompilerMeta[],
  outputTarget: OutputTargetAngular,
  config: Config
) {
  if (!Array.isArray(outputTarget.valueAccessorConfigs) || outputTarget.valueAccessorConfigs.length === 0) {
    return;
  }

  const targetDir = path.dirname(outputTarget.directivesProxyFile);

  const normalizedValueAccessors: NormalizedValueAccessors = outputTarget.valueAccessorConfigs.reduce(
    (allAccessors, va) => {
      const elementSelectors = Array.isArray(va.elementSelectors) ? va.elementSelectors : [va.elementSelectors];
      const type = va.type;
      let allElementSelectors: string[] = [];
      let allEventTargets: [string, string][] = [];

      if (allAccessors.hasOwnProperty(type)) {
        allElementSelectors = allAccessors[type].elementSelectors;
        allEventTargets = allAccessors[type].eventTargets;
      }
      return {
        ...allAccessors,
        [type]: {
          elementSelectors: allElementSelectors.concat(elementSelectors),
          eventTargets: allEventTargets.concat([[va.event, va.targetAttr]]),
        },
      };
    },
    {} as NormalizedValueAccessors
  );

  await Promise.all(
    Object.keys(normalizedValueAccessors).map(async (type) => {
      const valueAccessorType = type as ValueAccessorTypes; // Object.keys converts to string
      const targetFileName = `${type}-value-accessor.ts`;
      const targetFilePath = path.join(targetDir, targetFileName);
      const srcFilePath = path.join(__dirname, '../resources/control-value-accessors/', targetFileName);
      const srcFileContents = await compilerCtx.fs.readFile(srcFilePath);

      const finalText = createValueAccessor(
        srcFileContents,
        normalizedValueAccessors[valueAccessorType],
        outputTarget.outputType
      );
      await compilerCtx.fs.writeFile(targetFilePath, finalText);
    })
  );

  await copyResources(config, ['value-accessor.ts'], targetDir);
}

export function createValueAccessor(srcFileContents: string, valueAccessor: ValueAccessor, outputType?: OutputType) {
  const hostContents = valueAccessor.eventTargets.map((listItem) =>
    VALUE_ACCESSOR_EVENTTARGETS.replace(VALUE_ACCESSOR_EVENT, listItem[0]).replace(
      VALUE_ACCESSOR_TARGETATTR,
      listItem[1]
    )
  );
  return srcFileContents
    .replace(VALUE_ACCESSOR_SELECTORS, valueAccessor.elementSelectors.join(', '))
    .replace(VALUE_ACCESSOR_EVENTTARGETS, hostContents.join(`,${EOL}`))
    .replace(VALUE_ACCESSOR_STANDALONE, outputType && outputType !== OutputTypes.Standalone ? ',\nstandalone: false' : '');
}

function copyResources(config: Config, resourcesFilesToCopy: string[], directory: string) {
  if (!config.sys || !config.sys.copy) {
    throw new Error('stencil is not properly initialized at this step. Notify the developer');
  }
  const copyTasks = resourcesFilesToCopy.map((rf) => {
    return {
      src: path.join(__dirname, '../resources/control-value-accessors/', rf),
      dest: path.join(directory, rf),
      keepDirStructure: false,
      warn: false,
      ignore: [],
    };
  });
  return config.sys.copy(copyTasks, path.join(directory));
}

const VALUE_ACCESSOR_SELECTORS = `<VALUE_ACCESSOR_SELECTORS>`;
const VALUE_ACCESSOR_EVENT = `<VALUE_ACCESSOR_EVENT>`;
const VALUE_ACCESSOR_TARGETATTR = '<VALUE_ACCESSOR_TARGETATTR>';
const VALUE_ACCESSOR_STANDALONE = '<VALUE_ACCESSOR_STANDALONE>';
const VALUE_ACCESSOR_EVENTTARGETS = `    '(<VALUE_ACCESSOR_EVENT>)': 'handleChangeEvent($event.target?.["<VALUE_ACCESSOR_TARGETATTR>"])'`;
