import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAccessor } from './value-accessor';

@Directive({
  /* tslint:disable-next-line:directive-selector */
  selector: 'my-radio',
  host: {
    '(mySelect)': 'handleChangeEvent($event.target?.["checked"])'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioValueAccessor),
      multi: true
    }
  ]
})
export class RadioValueAccessor extends ValueAccessor {
  constructor(el: ElementRef) {
    super(el);
  }
}
