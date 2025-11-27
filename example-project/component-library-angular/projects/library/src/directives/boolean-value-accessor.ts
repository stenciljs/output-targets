import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAccessor } from './value-accessor';

@Directive({
  /* tslint:disable-next-line:directive-selector */
  selector: 'my-checkbox',
  host: {
    '(ionChange)': 'handleChangeEvent($event.target?.["checked"])'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanValueAccessor),
      multi: true
    }
  ]
})
export class BooleanValueAccessor extends ValueAccessor {
  constructor(el: ElementRef) {
    super(el);
  }
  override writeValue(value: any) {
    this.el.nativeElement.checked = this.lastValue = value == null ? false : value;
  }
}
