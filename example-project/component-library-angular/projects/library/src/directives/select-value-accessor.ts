import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAccessor } from './value-accessor';

@Directive({
  /* tslint:disable-next-line:directive-selector */
  selector: 'my-range, my-radio-group',
  host: {
    '(myChange)': 'handleChangeEvent($event.target?.["value"])'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectValueAccessor),
      multi: true
    }
  ]
})
export class SelectValueAccessor extends ValueAccessor {
  constructor(el: ElementRef) {
    super(el);
  }
}
