import { describe, it, expect } from 'vitest';
import { createValueAccessor, ValueAccessor } from '../src/generate-value-accessors';
import path from 'path';
import fs from 'fs';

describe('createValueAccessor', () => {
  it('should create a valid {type}-value-accessor.ts file when multiple value accessors of the same type are in the config', () => {
    const valueAccessor: ValueAccessor = {
      elementSelectors: ['my-input[type=text]', 'my-input[type=email]'],
      eventTargets: [
        ['myChange', 'value'],
        ['myEmailChange', 'value'],
      ],
    };

    const srcFilePath = path.join(__dirname, '../resources/control-value-accessors/text-value-accessor.ts');
    const srcFile = fs.readFileSync(srcFilePath, { encoding: 'utf-8' });
    const finalText = createValueAccessor(srcFile, valueAccessor, 'component');
    expect(finalText.trim()).toMatchInlineSnapshot(`
      "import { Directive, ElementRef } from '@angular/core';
      import { NG_VALUE_ACCESSOR } from '@angular/forms';

      import { ValueAccessor } from './value-accessor';

      @Directive({
        /* tslint:disable-next-line:directive-selector */
        selector: 'my-input[type=text], my-input[type=email]',
        host: {
          '(myChange)': 'handleChangeEvent($event.target?.["value"])',
          '(myEmailChange)': 'handleChangeEvent($event.target?.["value"])'
        },
        providers: [
          {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TextValueAccessor,
            multi: true
          }
        ],
      standalone: false
      })
      export class TextValueAccessor extends ValueAccessor {
        constructor(el: ElementRef) {
          super(el);
        }
      }"
    `);
  });
  it('should create a valid {type}-value-accessor.ts file with the correct standalone option', () => {
    const valueAccessor: ValueAccessor = {
      elementSelectors: ['my-input[type=text]', 'my-input[type=email]'],
      eventTargets: [
        ['myChange', 'value'],
        ['myEmailChange', 'value'],
      ],
    };

    const srcFilePath = path.join(__dirname, '../resources/control-value-accessors/text-value-accessor.ts');
    const srcFile = fs.readFileSync(srcFilePath, { encoding: 'utf-8' });
    const finalText = createValueAccessor(srcFile, valueAccessor, 'standalone');
    expect(finalText.trim()).toMatchInlineSnapshot(`
      "import { Directive, ElementRef } from '@angular/core';
      import { NG_VALUE_ACCESSOR } from '@angular/forms';

      import { ValueAccessor } from './value-accessor';

      @Directive({
        /* tslint:disable-next-line:directive-selector */
        selector: 'my-input[type=text], my-input[type=email]',
        host: {
          '(myChange)': 'handleChangeEvent($event.target?.["value"])',
          '(myEmailChange)': 'handleChangeEvent($event.target?.["value"])'
        },
        providers: [
          {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TextValueAccessor,
            multi: true
          }
        ]
      })
      export class TextValueAccessor extends ValueAccessor {
        constructor(el: ElementRef) {
          super(el);
        }
      }"
    `);
  });
});
