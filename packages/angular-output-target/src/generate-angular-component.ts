import type { CompilerJsDoc, ComponentCompilerEvent } from '@stencil/core/internal';

import { createComponentEventTypeImports, dashToPascalCase } from './utils';

/**
 * Creates an Angular component declaration.
 * @param tagName The tag name of the component.
 * @param inputs The inputs of the component.
 * @param outputs The outputs of the component.
 * @param methods The methods of the component.
 * @param includeImportCustomElements Whether to define the component as a custom element.
 * @returns The component declaration as a string.
 */
export const createAngularComponentDefinition = (
  tagName: string,
  inputs: string[],
  outputs: string[],
  methods: string[],
  includeImportCustomElements = false
) => {
  const tagNameAsPascal = dashToPascalCase(tagName);
  const defineCustomElementFn = `define${tagNameAsPascal}`;

  const hasInputs = inputs.length > 0;
  const hasOutputs = outputs.length > 0;
  const hasMethods = methods.length > 0;

  // Formats the input strings into comma separated, single quoted values.
  const formattedInputs = inputs.map((input) => `'${input}'`).join(', ');
  // Formats the output strings into comma separated, single quoted values.
  const formattedOutputs = outputs.map((output) => `'${output}'`).join(', ');
  // Formats the method strings into comma separated, single quoted values.
  const formattedMethods = methods.map((method) => `'${method}'`).join(', ');

  const proxyCmpOptions = [];

  if (includeImportCustomElements && defineCustomElementFn) {
    proxyCmpOptions.push(`\n  defineCustomElementFn: ${defineCustomElementFn}`);
  }

  if (hasInputs) {
    proxyCmpOptions.push(`\n  inputs: [${formattedInputs}]`);
  }

  if (hasMethods) {
    proxyCmpOptions.push(`\n  methods: [${formattedMethods}]`);
  }

  const output = `@ProxyCmp({${proxyCmpOptions.join(',')}\n})
@Component({
  selector: '${tagName}',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [${formattedInputs}],
})
export class ${tagNameAsPascal} {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;${
      hasOutputs
        ? `
    proxyOutputs(this, this.el, [${formattedOutputs}]);`
        : ''
    }
  }
}`;

  return output;
};

const formatOutputType = (componentTagName: string, event: ComponentCompilerEvent) => {
  /**
   * The original attribute contains the original type defined by the devs.
   * This regexp normalizes the reference, by removing linebreaks,
   * replacing consecutive spaces with a single space, and adding a single space after commas.
   */
  return Object.entries(event.complexType.references)
    .filter(([_, refObject]) => refObject.location === 'local' || refObject.location === 'import')
    .reduce(
      (type, [src, dst]) => {
        const renamedType = `I${componentTagName}${type}`;
        return renamedType
          .replace(new RegExp(`^${src}$`, 'g'), `${dst}`)
          .replace(new RegExp(`([^\\w])${src}([^\\w])`, 'g'), (v, p1, p2) => [p1, dst, p2].join(''));
      },
      event.complexType.original
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/,\s*/g, ', ')
    );
};

/**
 * Creates a formatted comment block based on the JS doc comment.
 * @param doc The compiler jsdoc.
 * @returns The formatted comment block as a string.
 */
const createDocComment = (doc: CompilerJsDoc) => {
  if (!doc || (doc.text.trim().length === 0 && doc.tags.length === 0)) {
    return '';
  }
  return `/**
   * ${doc.text}${doc.tags.length > 0 ? ' ' : ''}${doc.tags.map((tag) => `@${tag.name} ${tag.text}`)}
   */`;
};

/**
 * Creates the component interface type definition.
 * @param tagNameAsPascal The tag name as PascalCase.
 * @param events The events to generate the interface properties for.
 * @param componentCorePackage The component core package.
 * @param includeImportCustomElements Whether to include the import for the custom element definition.
 * @param customElementsDir The custom elements directory.
 * @returns The component interface type definition as a string.
 */
export const createComponentTypeDefinition = (
  tagNameAsPascal: string,
  events: ComponentCompilerEvent[],
  componentCorePackage: string,
  includeImportCustomElements = false,
  customElementsDir?: string
) => {
  const typeDefinition = `${createComponentEventTypeImports(tagNameAsPascal, events, {
    componentCorePackage,
    includeImportCustomElements,
    customElementsDir,
  })}

export interface ${tagNameAsPascal} extends Components.${tagNameAsPascal} {
${events
  .map((event) => {
    return `  ${createDocComment(event.docs)}
  ${event.name}: EventEmitter<CustomEvent<${formatOutputType(tagNameAsPascal, event)}>>;`;
  })
  .join('\n')}
}`;

  return typeDefinition;
};
