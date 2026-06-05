/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from 'component-library/components';

import { defineCustomElement as defineMyButton } from 'component-library/components/my-button.js';
import { defineCustomElement as defineMyButtonScoped } from 'component-library/components/my-button-scoped.js';
import { defineCustomElement as defineMyCheckbox } from 'component-library/components/my-checkbox.js';
import { defineCustomElement as defineMyComplexProps } from 'component-library/components/my-complex-props.js';
import { defineCustomElement as defineMyComplexPropsScoped } from 'component-library/components/my-complex-props-scoped.js';
import { defineCustomElement as defineMyComponent } from 'component-library/components/my-component.js';
import { defineCustomElement as defineMyComponentDelegatesFocus } from 'component-library/components/my-component-delegates-focus.js';
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
import { defineCustomElement as defineMyTransformTest } from 'component-library/components/my-transform-test.js';
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
  protected el: HTMLMyButtonElement;
  @Output() myFocus = new EventEmitter<MyButtonCustomEvent<void>>();
  @Output() myBlur = new EventEmitter<MyButtonCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyButtonCustomEvent } from 'component-library/components';

export declare interface MyButton extends Components.MyButton {
  /**
   * Emitted when the button has focus.
   */
  myFocus: EventEmitter<MyButtonCustomEvent<void>>;
  /**
   * Emitted when the button loses focus.
   */
  myBlur: EventEmitter<MyButtonCustomEvent<void>>;
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
  protected el: HTMLMyButtonScopedElement;
  @Output() myFocus = new EventEmitter<MyButtonScopedCustomEvent<void>>();
  @Output() myBlur = new EventEmitter<MyButtonScopedCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyButtonScopedCustomEvent } from 'component-library/components';

export declare interface MyButtonScoped extends Components.MyButtonScoped {
  /**
   * Emitted when the button has focus.
   */
  myFocus: EventEmitter<MyButtonScopedCustomEvent<void>>;
  /**
   * Emitted when the button loses focus.
   */
  myBlur: EventEmitter<MyButtonScopedCustomEvent<void>>;
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
  protected el: HTMLMyCheckboxElement;
  @Output() ionChange = new EventEmitter<MyCheckboxCustomEvent<IMyCheckboxCheckboxChangeEventDetail>>();
  @Output() ionChangeNested = new EventEmitter<MyCheckboxCustomEvent<IMyCheckboxCheckboxChangeNestedEventDetail>>();
  @Output() ionFocus = new EventEmitter<MyCheckboxCustomEvent<void>>();
  @Output() ionBlur = new EventEmitter<MyCheckboxCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyCheckboxCustomEvent } from 'component-library/components';
import type { CheckboxChangeEventDetail as IMyCheckboxCheckboxChangeEventDetail } from 'component-library/components';
import type { CheckboxChangeNestedEventDetail as IMyCheckboxCheckboxChangeNestedEventDetail } from 'component-library/components';

export declare interface MyCheckbox extends Components.MyCheckbox {
  /**
   * Emitted when the checked property has changed as a result of a user action such as a click.

This event will not emit when programmatically setting the `checked` property.
   */
  ionChange: EventEmitter<MyCheckboxCustomEvent<IMyCheckboxCheckboxChangeEventDetail>>;
  /**
   * Same as `ionChange`, but with a nested object for the value.
For demonstration purposes to be able to test ways to handle more complex events.
   */
  ionChangeNested: EventEmitter<MyCheckboxCustomEvent<IMyCheckboxCheckboxChangeNestedEventDetail>>;
  /**
   * Emitted when the checkbox has focus.
   */
  ionFocus: EventEmitter<MyCheckboxCustomEvent<void>>;
  /**
   * Emitted when the checkbox loses focus.
   */
  ionBlur: EventEmitter<MyCheckboxCustomEvent<void>>;
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
  protected el: HTMLMyComplexPropsElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyComplexPropsScopedElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MyComplexPropsScoped extends Components.MyComplexPropsScoped {}


@ProxyCmp({
  defineCustomElementFn: defineMyComponent,
  inputs: ['first', 'kidsNames', 'last', 'middleName']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['first', 'kidsNames', 'last', 'middleName'],
  outputs: ['myCustomEvent'],
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  @Output() myCustomEvent = new EventEmitter<MyComponentCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyComponentCustomEvent } from 'component-library/components';

export declare interface MyComponent extends Components.MyComponent {

  myCustomEvent: EventEmitter<MyComponentCustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineMyComponentDelegatesFocus
})
@Component({
  selector: 'my-component-delegates-focus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyComponentDelegatesFocus {
  protected el: HTMLMyComponentDelegatesFocusElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MyComponentDelegatesFocus extends Components.MyComponentDelegatesFocus {}


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
  protected el: HTMLMyComponentScopedElement;
  @Output() myCustomEvent = new EventEmitter<MyComponentScopedCustomEvent<IMyComponentScopedIMyComponent.someVar>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyComponentScopedCustomEvent } from 'component-library/components';
import type { IMyComponent as IMyComponentScopedIMyComponent } from 'component-library/components';

export declare interface MyComponentScoped extends Components.MyComponentScoped {
  /**
   * Testing an event without value
   */
  myCustomEvent: EventEmitter<MyComponentScopedCustomEvent<IMyComponentScopedIMyComponent.someVar>>;
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
  protected el: HTMLMyCounterElement;
  @Output() count = new EventEmitter<MyCounterCustomEvent<number>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyCounterCustomEvent } from 'component-library/components';

export declare interface MyCounter extends Components.MyCounter {
  /**
   * Emitted when the count changes
   */
  count: EventEmitter<MyCounterCustomEvent<number>>;
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
  protected el: HTMLMyInputElement;
  @Output() myInput = new EventEmitter<MyInputCustomEvent<KeyboardEvent>>();
  @Output() myChange = new EventEmitter<MyInputCustomEvent<IMyInputInputChangeEventDetail>>();
  @Output() myBlur = new EventEmitter<MyInputCustomEvent<void>>();
  @Output() myFocus = new EventEmitter<MyInputCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyInputCustomEvent } from 'component-library/components';
import type { InputChangeEventDetail as IMyInputInputChangeEventDetail } from 'component-library/components';

export declare interface MyInput extends Components.MyInput {
  /**
   * Emitted when a keyboard input occurred.
   */
  myInput: EventEmitter<MyInputCustomEvent<KeyboardEvent>>;
  /**
   * Emitted when the value has changed.
   */
  myChange: EventEmitter<MyInputCustomEvent<IMyInputInputChangeEventDetail>>;
  /**
   * Emitted when the input loses focus.
   */
  myBlur: EventEmitter<MyInputCustomEvent<void>>;
  /**
   * Emitted when the input has focus.
   */
  myFocus: EventEmitter<MyInputCustomEvent<void>>;
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
  protected el: HTMLMyInputScopedElement;
  @Output() myInput = new EventEmitter<MyInputScopedCustomEvent<KeyboardEvent>>();
  @Output() myChange = new EventEmitter<MyInputScopedCustomEvent<IMyInputScopedInputChangeEventDetail>>();
  @Output() myBlur = new EventEmitter<MyInputScopedCustomEvent<void>>();
  @Output() myFocus = new EventEmitter<MyInputScopedCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyInputScopedCustomEvent } from 'component-library/components';
import type { InputChangeEventDetail as IMyInputScopedInputChangeEventDetail } from 'component-library/components';

export declare interface MyInputScoped extends Components.MyInputScoped {
  /**
   * Emitted when a keyboard input occurred.
   */
  myInput: EventEmitter<MyInputScopedCustomEvent<KeyboardEvent>>;
  /**
   * Emitted when the value has changed.
   */
  myChange: EventEmitter<MyInputScopedCustomEvent<IMyInputScopedInputChangeEventDetail>>;
  /**
   * Emitted when the input loses focus.
   */
  myBlur: EventEmitter<MyInputScopedCustomEvent<void>>;
  /**
   * Emitted when the input has focus.
   */
  myFocus: EventEmitter<MyInputScopedCustomEvent<void>>;
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
  protected el: HTMLMyListElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyListItemElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyListItemScopedElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyListScopedElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyPopoverElement;
  @Output() myPopoverDidPresent = new EventEmitter<MyPopoverCustomEvent<void>>();
  @Output() myPopoverWillPresent = new EventEmitter<MyPopoverCustomEvent<void>>();
  @Output() myPopoverWillDismiss = new EventEmitter<MyPopoverCustomEvent<IMyPopoverOverlayEventDetail>>();
  @Output() myPopoverDidDismiss = new EventEmitter<MyPopoverCustomEvent<IMyPopoverOverlayEventDetail>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyPopoverCustomEvent } from 'component-library/components';
import type { OverlayEventDetail as IMyPopoverOverlayEventDetail } from 'component-library/components';

export declare interface MyPopover extends Components.MyPopover {
  /**
   * Emitted after the popover has presented.
   */
  myPopoverDidPresent: EventEmitter<MyPopoverCustomEvent<void>>;
  /**
   * Emitted before the popover has presented.
   */
  myPopoverWillPresent: EventEmitter<MyPopoverCustomEvent<void>>;
  /**
   * Emitted before the popover has dismissed.
   */
  myPopoverWillDismiss: EventEmitter<MyPopoverCustomEvent<IMyPopoverOverlayEventDetail>>;
  /**
   * Emitted after the popover has dismissed.
   */
  myPopoverDidDismiss: EventEmitter<MyPopoverCustomEvent<IMyPopoverOverlayEventDetail>>;
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
  protected el: HTMLMyRadioElement;
  @Output() ionFocus = new EventEmitter<MyRadioCustomEvent<void>>();
  @Output() ionBlur = new EventEmitter<MyRadioCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyRadioCustomEvent } from 'component-library/components';

export declare interface MyRadio extends Components.MyRadio {
  /**
   * Emitted when the radio button has focus.
   */
  ionFocus: EventEmitter<MyRadioCustomEvent<void>>;
  /**
   * Emitted when the radio button loses focus.
   */
  ionBlur: EventEmitter<MyRadioCustomEvent<void>>;
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
  protected el: HTMLMyRadioGroupElement;
  @Output() myChange = new EventEmitter<MyRadioGroupCustomEvent<IMyRadioGroupRadioGroupChangeEventDetail>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyRadioGroupCustomEvent } from 'component-library/components';
import type { RadioGroupChangeEventDetail as IMyRadioGroupRadioGroupChangeEventDetail } from 'component-library/components';

export declare interface MyRadioGroup extends Components.MyRadioGroup {
  /**
   * Emitted when the value has changed.

This event will not emit when programmatically setting the `value` property.
   */
  myChange: EventEmitter<MyRadioGroupCustomEvent<IMyRadioGroupRadioGroupChangeEventDetail>>;
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
  protected el: HTMLMyRangeElement;
  @Output() myChange = new EventEmitter<MyRangeCustomEvent<IMyRangeRangeChangeEventDetail>>();
  @Output() myFocus = new EventEmitter<MyRangeCustomEvent<void>>();
  @Output() myBlur = new EventEmitter<MyRangeCustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { MyRangeCustomEvent } from 'component-library/components';
import type { RangeChangeEventDetail as IMyRangeRangeChangeEventDetail } from 'component-library/components';

export declare interface MyRange extends Components.MyRange {
  /**
   * Emitted when the value property has changed.
   */
  myChange: EventEmitter<MyRangeCustomEvent<IMyRangeRangeChangeEventDetail>>;
  /**
   * Emitted when the range has focus.
   */
  myFocus: EventEmitter<MyRangeCustomEvent<void>>;
  /**
   * Emitted when the range loses focus.
   */
  myBlur: EventEmitter<MyRangeCustomEvent<void>>;
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
  protected el: HTMLMyToggleElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
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
  protected el: HTMLMyToggleContentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MyToggleContent extends Components.MyToggleContent {}


@ProxyCmp({
  defineCustomElementFn: defineMyTransformTest,
  inputs: ['message']
})
@Component({
  selector: 'my-transform-test',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['message'],
})
export class MyTransformTest {
  protected el: HTMLMyTransformTestElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MyTransformTest extends Components.MyTransformTest {}


