/* tslint:disable */
/* auto-generated angular directive proxies */
import { inject, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from 'component-library/components';

import { defineCustomElement as defineMyButton } from 'component-library/components/my-button.js';
import { defineCustomElement as defineMyButtonScoped } from 'component-library/components/my-button-scoped.js';
import { defineCustomElement as defineMyCheckbox } from 'component-library/components/my-checkbox.js';
import { defineCustomElement as defineMyComplexProps } from 'component-library/components/my-complex-props.js';
import { defineCustomElement as defineMyComplexPropsScoped } from 'component-library/components/my-complex-props-scoped.js';
import { defineCustomElement as defineMyComponent } from 'component-library/components/my-component.js';
import { defineCustomElement as defineMyComponentScoped } from 'component-library/components/my-component-scoped.js';
import { defineCustomElement as defineMyCounter } from 'component-library/components/my-counter.js';
import { defineCustomElement as defineMyInput } from 'component-library/components/my-input.js';
import { defineCustomElement as defineMyInputScoped } from 'component-library/components/my-input-scoped.js';
import { defineCustomElement as defineMyList } from 'component-library/components/my-list.js';
import { defineCustomElement as defineMyListItem } from 'component-library/components/my-list-item.js';
import { defineCustomElement as defineMyListItemScoped } from 'component-library/components/my-list-item-scoped.js';
import { defineCustomElement as defineMyListScoped } from 'component-library/components/my-list-scoped.js';
import { defineCustomElement as defineMyPopover } from 'component-library/components/my-popover.js';
import { defineCustomElement as defineMyRadio } from 'component-library/components/my-radio.js';
import { defineCustomElement as defineMyRadioGroup } from 'component-library/components/my-radio-group.js';
import { defineCustomElement as defineMyRange } from 'component-library/components/my-range.js';
import { defineCustomElement as defineMyToggle } from 'component-library/components/my-toggle.js';
import { defineCustomElement as defineMyToggleContent } from 'component-library/components/my-toggle-content.js';
@ProxyCmp({
  defineCustomElementFn: defineMyButton,
  inputs: ['buttonType', 'color', 'disabled', 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', 'strong', 'target', 'type']
})
@Component({
  selector: 'my-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['buttonType', 'color', 'disabled', 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', 'strong', 'target', 'type'],
  outputs: ['myFocus', 'myBlur'],
})
export class MyButton {
  private readonly elementRef = inject(ElementRef<HTMLMyButtonElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyButtonElement {
    return this.elementRef.nativeElement;
  }
  
  
  myFocus$ = fromEvent<CustomEvent<void>>(this.el, "myFocus");
  myFocusChange = outputFromObservable(this.myFocus$);
  
  myBlur$ = fromEvent<CustomEvent<void>>(this.el, "myBlur");
  myBlurChange = outputFromObservable(this.myBlur$);
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyButton extends Components.MyButton {
  /**
   * Emitted when the button has focus.
   */
  myFocus: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the button loses focus.
   */
  myBlur: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyButtonScoped,
  inputs: ['buttonType', 'color', 'disabled', 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', 'strong', 'target', 'type']
})
@Component({
  selector: 'my-button-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['buttonType', 'color', 'disabled', 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', 'strong', 'target', 'type'],
  outputs: ['myFocus', 'myBlur'],
})
export class MyButtonScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyButtonScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyButtonScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  myFocus$ = fromEvent<CustomEvent<void>>(this.el, "myFocus");
  myFocusChange = outputFromObservable(this.myFocus$);
  
  myBlur$ = fromEvent<CustomEvent<void>>(this.el, "myBlur");
  myBlurChange = outputFromObservable(this.myBlur$);
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyButtonScoped extends Components.MyButtonScoped {
  /**
   * Emitted when the button has focus.
   */
  myFocus: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the button loses focus.
   */
  myBlur: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyCheckbox,
  inputs: ['alignment', 'checked', 'color', 'disabled', 'indeterminate', 'justify', 'labelPlacement', 'mode', 'name', 'value']
})
@Component({
  selector: 'my-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['alignment', 'checked', 'color', 'disabled', 'indeterminate', 'justify', 'labelPlacement', 'mode', 'name', 'value'],
  outputs: ['ionChange', 'ionChangeNested', 'ionFocus', 'ionBlur'],
})
export class MyCheckbox {
  private readonly elementRef = inject(ElementRef<HTMLMyCheckboxElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyCheckboxElement {
    return this.elementRef.nativeElement;
  }
  
  
  ionChange$ = fromEvent<CustomEvent<IMyCheckboxCheckboxChangeEventDetail>>(this.el, "ionChange");
  ionChangeChange = outputFromObservable(this.ionChange$);
  
  ionChangeNested$ = fromEvent<CustomEvent<IMyCheckboxCheckboxChangeNestedEventDetail>>(this.el, "ionChangeNested");
  ionChangeNestedChange = outputFromObservable(this.ionChangeNested$);
  
  ionFocus$ = fromEvent<CustomEvent<void>>(this.el, "ionFocus");
  ionFocusChange = outputFromObservable(this.ionFocus$);
  
  ionBlur$ = fromEvent<CustomEvent<void>>(this.el, "ionBlur");
  ionBlurChange = outputFromObservable(this.ionBlur$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { CheckboxChangeEventDetail as IMyCheckboxCheckboxChangeEventDetail } from 'component-library/components';
import type { CheckboxChangeNestedEventDetail as IMyCheckboxCheckboxChangeNestedEventDetail } from 'component-library/components';

export declare interface MyCheckbox extends Components.MyCheckbox {
  /**
   * Emitted when the checked property has changed as a result of a user action such as a click.

This event will not emit when programmatically setting the `checked` property.
   */
  ionChange: EventEmitter<CustomEvent<IMyCheckboxCheckboxChangeEventDetail>>;
  /**
   * Same as `ionChange`, but with a nested object for the value.
For demonstration purposes to be able to test ways to handle more complex events.
   */
  ionChangeNested: EventEmitter<CustomEvent<IMyCheckboxCheckboxChangeNestedEventDetail>>;
  /**
   * Emitted when the checkbox has focus.
   */
  ionFocus: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the checkbox loses focus.
   */
  ionBlur: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyComplexProps,
  inputs: ['baz', 'foo', 'grault', 'quux', 'waldo']
})
@Component({
  selector: 'my-complex-props',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['baz', 'foo', 'grault', 'quux', 'waldo'],
})
export class MyComplexProps {
  private readonly elementRef = inject(ElementRef<HTMLMyComplexPropsElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyComplexPropsElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyComplexProps extends Components.MyComplexProps {}


@ProxyCmp({
  defineCustomElementFn: defineMyComplexPropsScoped,
  inputs: ['baz', 'foo', 'grault', 'quux', 'waldo']
})
@Component({
  selector: 'my-complex-props-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['baz', 'foo', 'grault', 'quux', 'waldo'],
})
export class MyComplexPropsScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyComplexPropsScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyComplexPropsScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyComplexPropsScoped extends Components.MyComplexPropsScoped {}


@ProxyCmp({
  defineCustomElementFn: defineMyComponent,
  inputs: ['first', 'last', 'middleName']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['first', 'last', 'middleName'],
})
export class MyComponent {
  private readonly elementRef = inject(ElementRef<HTMLMyComponentElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyComponentElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyComponent extends Components.MyComponent {}


@ProxyCmp({
  defineCustomElementFn: defineMyComponentScoped,
  inputs: ['first', 'last', 'middleName']
})
@Component({
  selector: 'my-component-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['first', 'last', 'middleName'],
  outputs: ['myCustomEvent'],
})
export class MyComponentScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyComponentScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyComponentScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  myCustomEvent$ = fromEvent<CustomEvent<IMyComponentScopedIMyComponent.someVar>>(this.el, "myCustomEvent");
  myCustomEventChange = outputFromObservable(this.myCustomEvent$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { IMyComponent as IMyComponentScopedIMyComponent } from 'component-library/components';

export declare interface MyComponentScoped extends Components.MyComponentScoped {
  /**
   * Testing an event without value
   */
  myCustomEvent: EventEmitter<CustomEvent<IMyComponentScopedIMyComponent.someVar>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyCounter,
  inputs: ['startValue']
})
@Component({
  selector: 'my-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['startValue'],
  outputs: ['count'],
})
export class MyCounter {
  private readonly elementRef = inject(ElementRef<HTMLMyCounterElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyCounterElement {
    return this.elementRef.nativeElement;
  }
  
  
  count$ = fromEvent<CustomEvent<number>>(this.el, "count");
  countChange = outputFromObservable(this.count$);
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyCounter extends Components.MyCounter {
  /**
   * Emitted when the count changes
   */
  count: EventEmitter<CustomEvent<number>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyInput,
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'clearInput', 'clearOnEdit', 'color', 'disabled', 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'spellcheck', 'step', 'type', 'value'],
  methods: ['setFocus', 'getInputElement']
})
@Component({
  selector: 'my-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'clearInput', 'clearOnEdit', 'color', 'disabled', 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'spellcheck', 'step', 'type', 'value'],
  outputs: ['myInput', 'myChange', 'myBlur', 'myFocus'],
})
export class MyInput {
  private readonly elementRef = inject(ElementRef<HTMLMyInputElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyInputElement {
    return this.elementRef.nativeElement;
  }
  
  
  myInput$ = fromEvent<CustomEvent<KeyboardEvent>>(this.el, "myInput");
  myInputChange = outputFromObservable(this.myInput$);
  
  myChange$ = fromEvent<CustomEvent<IMyInputInputChangeEventDetail>>(this.el, "myChange");
  myChangeChange = outputFromObservable(this.myChange$);
  
  myBlur$ = fromEvent<CustomEvent<void>>(this.el, "myBlur");
  myBlurChange = outputFromObservable(this.myBlur$);
  
  myFocus$ = fromEvent<CustomEvent<void>>(this.el, "myFocus");
  myFocusChange = outputFromObservable(this.myFocus$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { InputChangeEventDetail as IMyInputInputChangeEventDetail } from 'component-library/components';

export declare interface MyInput extends Components.MyInput {
  /**
   * Emitted when a keyboard input occurred.
   */
  myInput: EventEmitter<CustomEvent<KeyboardEvent>>;
  /**
   * Emitted when the value has changed.
   */
  myChange: EventEmitter<CustomEvent<IMyInputInputChangeEventDetail>>;
  /**
   * Emitted when the input loses focus.
   */
  myBlur: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the input has focus.
   */
  myFocus: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyInputScoped,
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'clearInput', 'clearOnEdit', 'color', 'disabled', 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'spellcheck', 'step', 'type', 'value'],
  methods: ['setFocus', 'getInputElement']
})
@Component({
  selector: 'my-input-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'clearInput', 'clearOnEdit', 'color', 'disabled', 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'spellcheck', 'step', 'type', 'value'],
  outputs: ['myInput', 'myChange', 'myBlur', 'myFocus'],
})
export class MyInputScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyInputScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyInputScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  myInput$ = fromEvent<CustomEvent<KeyboardEvent>>(this.el, "myInput");
  myInputChange = outputFromObservable(this.myInput$);
  
  myChange$ = fromEvent<CustomEvent<IMyInputScopedInputChangeEventDetail>>(this.el, "myChange");
  myChangeChange = outputFromObservable(this.myChange$);
  
  myBlur$ = fromEvent<CustomEvent<void>>(this.el, "myBlur");
  myBlurChange = outputFromObservable(this.myBlur$);
  
  myFocus$ = fromEvent<CustomEvent<void>>(this.el, "myFocus");
  myFocusChange = outputFromObservable(this.myFocus$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { InputChangeEventDetail as IMyInputScopedInputChangeEventDetail } from 'component-library/components';

export declare interface MyInputScoped extends Components.MyInputScoped {
  /**
   * Emitted when a keyboard input occurred.
   */
  myInput: EventEmitter<CustomEvent<KeyboardEvent>>;
  /**
   * Emitted when the value has changed.
   */
  myChange: EventEmitter<CustomEvent<IMyInputScopedInputChangeEventDetail>>;
  /**
   * Emitted when the input loses focus.
   */
  myBlur: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the input has focus.
   */
  myFocus: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyList
})
@Component({
  selector: 'my-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyList {
  private readonly elementRef = inject(ElementRef<HTMLMyListElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyListElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyList extends Components.MyList {}


@ProxyCmp({
  defineCustomElementFn: defineMyListItem
})
@Component({
  selector: 'my-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyListItem {
  private readonly elementRef = inject(ElementRef<HTMLMyListItemElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyListItemElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyListItem extends Components.MyListItem {}


@ProxyCmp({
  defineCustomElementFn: defineMyListItemScoped
})
@Component({
  selector: 'my-list-item-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyListItemScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyListItemScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyListItemScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyListItemScoped extends Components.MyListItemScoped {}


@ProxyCmp({
  defineCustomElementFn: defineMyListScoped
})
@Component({
  selector: 'my-list-scoped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyListScoped {
  private readonly elementRef = inject(ElementRef<HTMLMyListScopedElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyListScopedElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyListScoped extends Components.MyListScoped {}


@ProxyCmp({
  defineCustomElementFn: defineMyPopover,
  inputs: ['animated', 'backdropDismiss', 'component', 'componentProps', 'cssClass', 'event', 'keyboardClose', 'mode', 'showBackdrop', 'translucent'],
  methods: ['present', 'dismiss', 'onDidDismiss', 'onWillDismiss']
})
@Component({
  selector: 'my-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['animated', 'backdropDismiss', { name: 'component', required: true }, 'componentProps', 'cssClass', 'event', 'keyboardClose', 'mode', 'showBackdrop', 'translucent'],
  outputs: ['myPopoverDidPresent', 'myPopoverWillPresent', 'myPopoverWillDismiss', 'myPopoverDidDismiss'],
})
export class MyPopover {
  private readonly elementRef = inject(ElementRef<HTMLMyPopoverElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyPopoverElement {
    return this.elementRef.nativeElement;
  }
  
  
  myPopoverDidPresent$ = fromEvent<CustomEvent<void>>(this.el, "myPopoverDidPresent");
  myPopoverDidPresentChange = outputFromObservable(this.myPopoverDidPresent$);
  
  myPopoverWillPresent$ = fromEvent<CustomEvent<void>>(this.el, "myPopoverWillPresent");
  myPopoverWillPresentChange = outputFromObservable(this.myPopoverWillPresent$);
  
  myPopoverWillDismiss$ = fromEvent<CustomEvent<IMyPopoverOverlayEventDetail>>(this.el, "myPopoverWillDismiss");
  myPopoverWillDismissChange = outputFromObservable(this.myPopoverWillDismiss$);
  
  myPopoverDidDismiss$ = fromEvent<CustomEvent<IMyPopoverOverlayEventDetail>>(this.el, "myPopoverDidDismiss");
  myPopoverDidDismissChange = outputFromObservable(this.myPopoverDidDismiss$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { OverlayEventDetail as IMyPopoverOverlayEventDetail } from 'component-library/components';

export declare interface MyPopover extends Components.MyPopover {
  /**
   * Emitted after the popover has presented.
   */
  myPopoverDidPresent: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted before the popover has presented.
   */
  myPopoverWillPresent: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted before the popover has dismissed.
   */
  myPopoverWillDismiss: EventEmitter<CustomEvent<IMyPopoverOverlayEventDetail>>;
  /**
   * Emitted after the popover has dismissed.
   */
  myPopoverDidDismiss: EventEmitter<CustomEvent<IMyPopoverOverlayEventDetail>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyRadio,
  inputs: ['alignment', 'color', 'disabled', 'justify', 'labelPlacement', 'mode', 'name', 'value']
})
@Component({
  selector: 'my-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['alignment', 'color', 'disabled', 'justify', 'labelPlacement', 'mode', 'name', 'value'],
  outputs: ['ionFocus', 'ionBlur'],
})
export class MyRadio {
  private readonly elementRef = inject(ElementRef<HTMLMyRadioElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyRadioElement {
    return this.elementRef.nativeElement;
  }
  
  
  ionFocus$ = fromEvent<CustomEvent<void>>(this.el, "ionFocus");
  ionFocusChange = outputFromObservable(this.ionFocus$);
  
  ionBlur$ = fromEvent<CustomEvent<void>>(this.el, "ionBlur");
  ionBlurChange = outputFromObservable(this.ionBlur$);
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyRadio extends Components.MyRadio {
  /**
   * Emitted when the radio button has focus.
   */
  ionFocus: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the radio button loses focus.
   */
  ionBlur: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyRadioGroup,
  inputs: ['allowEmptySelection', 'compareWith', 'name', 'value']
})
@Component({
  selector: 'my-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowEmptySelection', 'compareWith', 'name', 'value'],
  outputs: ['myChange'],
})
export class MyRadioGroup {
  private readonly elementRef = inject(ElementRef<HTMLMyRadioGroupElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyRadioGroupElement {
    return this.elementRef.nativeElement;
  }
  
  
  myChange$ = fromEvent<CustomEvent<IMyRadioGroupRadioGroupChangeEventDetail>>(this.el, "myChange");
  myChangeChange = outputFromObservable(this.myChange$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { RadioGroupChangeEventDetail as IMyRadioGroupRadioGroupChangeEventDetail } from 'component-library/components';

export declare interface MyRadioGroup extends Components.MyRadioGroup {
  /**
   * Emitted when the value has changed.

This event will not emit when programmatically setting the `value` property.
   */
  myChange: EventEmitter<CustomEvent<IMyRadioGroupRadioGroupChangeEventDetail>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyRange,
  inputs: ['color', 'debounce', 'disabled', 'dualKnobs', 'max', 'min', 'mode', 'name', 'pin', 'snaps', 'step', 'ticks', 'value']
})
@Component({
  selector: 'my-range',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['color', 'debounce', 'disabled', 'dualKnobs', 'max', 'min', 'mode', 'name', 'pin', 'snaps', 'step', 'ticks', 'value'],
  outputs: ['myChange', 'myFocus', 'myBlur'],
})
export class MyRange {
  private readonly elementRef = inject(ElementRef<HTMLMyRangeElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyRangeElement {
    return this.elementRef.nativeElement;
  }
  
  
  myChange$ = fromEvent<CustomEvent<IMyRangeRangeChangeEventDetail>>(this.el, "myChange");
  myChangeChange = outputFromObservable(this.myChange$);
  
  myFocus$ = fromEvent<CustomEvent<void>>(this.el, "myFocus");
  myFocusChange = outputFromObservable(this.myFocus$);
  
  myBlur$ = fromEvent<CustomEvent<void>>(this.el, "myBlur");
  myBlurChange = outputFromObservable(this.myBlur$);
  
  constructor() {
    this.cdr.detach();
  }
}


import type { RangeChangeEventDetail as IMyRangeRangeChangeEventDetail } from 'component-library/components';

export declare interface MyRange extends Components.MyRange {
  /**
   * Emitted when the value property has changed.
   */
  myChange: EventEmitter<CustomEvent<IMyRangeRangeChangeEventDetail>>;
  /**
   * Emitted when the range has focus.
   */
  myFocus: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the range loses focus.
   */
  myBlur: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyToggle
})
@Component({
  selector: 'my-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyToggle {
  private readonly elementRef = inject(ElementRef<HTMLMyToggleElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyToggleElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyToggle extends Components.MyToggle {}


@ProxyCmp({
  defineCustomElementFn: defineMyToggleContent,
  inputs: ['visible']
})
@Component({
  selector: 'my-toggle-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['visible'],
})
export class MyToggleContent {
  private readonly elementRef = inject(ElementRef<HTMLMyToggleContentElement>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected get el(): HTMLMyToggleContentElement {
    return this.elementRef.nativeElement;
  }
  
  
  constructor() {
    this.cdr.detach();
  }
}


export declare interface MyToggleContent extends Components.MyToggleContent {}


