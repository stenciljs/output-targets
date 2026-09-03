/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';
import { nullableBooleanAttribute } from './angular-component-lib/boolean-attribute';

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
  inputs: ['buttonType', 'color', { name: 'disabled', transform: nullableBooleanAttribute }, 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', { name: 'strong', transform: nullableBooleanAttribute }, 'target', 'type'],
  outputs: ['myFocus', 'myBlur'],
})
export class MyButton {
  protected el: HTMLMyButtonElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyButton['color']) {};
    /**
   * The type of button. @default 'button'
   */
  set buttonType(_: Components.MyButton['buttonType']) {};
    /**
   * If `true`, the user cannot interact with the button. @default false
   */
  set disabled(_: Components.MyButton['disabled']) {};
    /**
   * Set to `"block"` for a full-width button or to `"full"` for a full-width button
without left and right borders.
   */
  set expand(_: Components.MyButton['expand']) {};
    /**
   * Set to `"clear"` for a transparent button, to `"outline"` for a transparent
button with a border, or to `"solid"`. The default style is `"solid"` except inside of
a toolbar, where the default is `"clear"`.
   */
  set fill(_: Components.MyButton['fill']) {};
    /**
   * This attribute instructs browsers to download a URL instead of navigating to
it, so the user will be prompted to save it as a local file. If the attribute
has a value, it is used as the pre-filled file name in the Save prompt
(the user can still change the file name if they want).
   */
  set download(_: Components.MyButton['download']) {};
    /**
   * Contains a URL or a URL fragment that the hyperlink points to.
If this property is set, an anchor tag will be rendered.
   */
  set href(_: Components.MyButton['href']) {};
    /**
   * Specifies the relationship of the target object to the link object.
The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).
   */
  set rel(_: Components.MyButton['rel']) {};
    /**
   * The button shape.
   */
  set shape(_: Components.MyButton['shape']) {};
    /**
   * The button size.
   */
  set size(_: Components.MyButton['size']) {};
    /**
   * If `true`, activates a button with a heavier font weight. @default false
   */
  set strong(_: Components.MyButton['strong']) {};
    /**
   * Specifies where to display the linked URL.
Only applies when an `href` is provided.
Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.
   */
  set target(_: Components.MyButton['target']) {};
    /**
   * The type of the button. @default 'button'
   */
  set type(_: Components.MyButton['type']) {};
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
  inputs: ['buttonType', 'color', { name: 'disabled', transform: nullableBooleanAttribute }, 'download', 'expand', 'fill', 'href', 'mode', 'rel', 'shape', 'size', { name: 'strong', transform: nullableBooleanAttribute }, 'target', 'type'],
  outputs: ['myFocus', 'myBlur'],
})
export class MyButtonScoped {
  protected el: HTMLMyButtonScopedElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyButtonScoped['color']) {};
    /**
   * The type of button. @default 'button'
   */
  set buttonType(_: Components.MyButtonScoped['buttonType']) {};
    /**
   * If `true`, the user cannot interact with the button. @default false
   */
  set disabled(_: Components.MyButtonScoped['disabled']) {};
    /**
   * Set to `"block"` for a full-width button or to `"full"` for a full-width button
without left and right borders.
   */
  set expand(_: Components.MyButtonScoped['expand']) {};
    /**
   * Set to `"clear"` for a transparent button, to `"outline"` for a transparent
button with a border, or to `"solid"`. The default style is `"solid"` except inside of
a toolbar, where the default is `"clear"`.
   */
  set fill(_: Components.MyButtonScoped['fill']) {};
    /**
   * This attribute instructs browsers to download a URL instead of navigating to
it, so the user will be prompted to save it as a local file. If the attribute
has a value, it is used as the pre-filled file name in the Save prompt
(the user can still change the file name if they want).
   */
  set download(_: Components.MyButtonScoped['download']) {};
    /**
   * Contains a URL or a URL fragment that the hyperlink points to.
If this property is set, an anchor tag will be rendered.
   */
  set href(_: Components.MyButtonScoped['href']) {};
    /**
   * Specifies the relationship of the target object to the link object.
The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).
   */
  set rel(_: Components.MyButtonScoped['rel']) {};
    /**
   * The button shape.
   */
  set shape(_: Components.MyButtonScoped['shape']) {};
    /**
   * The button size.
   */
  set size(_: Components.MyButtonScoped['size']) {};
    /**
   * If `true`, activates a button with a heavier font weight. @default false
   */
  set strong(_: Components.MyButtonScoped['strong']) {};
    /**
   * Specifies where to display the linked URL.
Only applies when an `href` is provided.
Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.
   */
  set target(_: Components.MyButtonScoped['target']) {};
    /**
   * The type of the button. @default 'button'
   */
  set type(_: Components.MyButtonScoped['type']) {};
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
  inputs: ['alignment', { name: 'checked', transform: nullableBooleanAttribute }, 'color', { name: 'disabled', transform: nullableBooleanAttribute }, { name: 'indeterminate', transform: nullableBooleanAttribute }, 'justify', 'labelPlacement', 'mode', 'name', 'value'],
  outputs: ['ionChange', 'ionChangeNested', 'ionFocus', 'ionBlur'],
})
export class MyCheckbox {
  protected el: HTMLMyCheckboxElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyCheckbox['color']) {};
    /**
   * The name of the control, which is submitted with the form data. @default this.inputId
   */
  set name(_: Components.MyCheckbox['name']) {};
    /**
   * If `true`, the checkbox is selected. @default false
   */
  set checked(_: Components.MyCheckbox['checked']) {};
    /**
   * If `true`, the checkbox will visually appear as indeterminate. @default false
   */
  set indeterminate(_: Components.MyCheckbox['indeterminate']) {};
    /**
   * If `true`, the user cannot interact with the checkbox. @default false
   */
  set disabled(_: Components.MyCheckbox['disabled']) {};
    /**
   * The value of the checkbox does not mean if it's checked or not, use the `checked`
property for that.

The value of a checkbox is analogous to the value of an `<input type="checkbox">`,
it's only used when the checkbox participates in a native `<form>`. @default 'on'
   */
  set value(_: Components.MyCheckbox['value']) {};
    /**
   * Where to place the label relative to the checkbox.
`"start"`: The label will appear to the left of the checkbox in LTR and to the right in RTL.
`"end"`: The label will appear to the right of the checkbox in LTR and to the left in RTL.
`"fixed"`: The label has the same behavior as `"start"` except it also has a fixed width. Long text will be truncated with ellipses ("...").
`"stacked"`: The label will appear above the checkbox regardless of the direction. The alignment of the label can be controlled with the `alignment` property. @default 'start'
   */
  set labelPlacement(_: Components.MyCheckbox['labelPlacement']) {};
    /**
   * How to pack the label and checkbox within a line.
`"start"`: The label and checkbox will appear on the left in LTR and
on the right in RTL.
`"end"`: The label and checkbox will appear on the right in LTR and
on the left in RTL.
`"space-between"`: The label and checkbox will appear on opposite
ends of the line with space between the two elements.
Setting this property will change the checkbox `display` to `block`.
   */
  set justify(_: Components.MyCheckbox['justify']) {};
    /**
   * How to control the alignment of the checkbox and label on the cross axis.
`"start"`: The label and control will appear on the left of the cross axis in LTR, and on the right side in RTL.
`"center"`: The label and control will appear at the center of the cross axis in both LTR and RTL.
Setting this property will change the checkbox `display` to `block`.
   */
  set alignment(_: Components.MyCheckbox['alignment']) {};
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
    /**
   * basic object
   */
  set foo(_: Components.MyComplexProps['foo']) {};
    /**
   * map objects
   */
  set baz(_: Components.MyComplexProps['baz']) {};
    /**
   * set objects
   */
  set quux(_: Components.MyComplexProps['quux']) {};
    /**
   * infinity
   */
  set grault(_: Components.MyComplexProps['grault']) {};
    /**
   * null
   */
  set waldo(_: Components.MyComplexProps['waldo']) {};
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
    /**
   * basic object
   */
  set foo(_: Components.MyComplexPropsScoped['foo']) {};
    /**
   * map objects
   */
  set baz(_: Components.MyComplexPropsScoped['baz']) {};
    /**
   * set objects
   */
  set quux(_: Components.MyComplexPropsScoped['quux']) {};
    /**
   * infinity
   */
  set grault(_: Components.MyComplexPropsScoped['grault']) {};
    /**
   * null
   */
  set waldo(_: Components.MyComplexPropsScoped['waldo']) {};
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
    /**
   * The first name
   */
  set first(_: Components.MyComponent['first']) {};
    /**
   * The middle name (using kebab case name)
   */
  set middleName(_: Components.MyComponent['middleName']) {};
    /**
   * The last name
   */
  set last(_: Components.MyComponent['last']) {};
  
  set kidsNames(_: Components.MyComponent['kidsNames']) {};
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
    /**
   * The first name
   */
  set first(_: Components.MyComponentScoped['first']) {};
    /**
   * The middle name (using kebab case name)
   */
  set middleName(_: Components.MyComponentScoped['middleName']) {};
    /**
   * The last name
   */
  set last(_: Components.MyComponentScoped['last']) {};
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
    /**
   * The start value
   */
  set startValue(_: Components.MyCounter['startValue']) {};
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
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', { name: 'autofocus', transform: nullableBooleanAttribute }, { name: 'clearInput', transform: nullableBooleanAttribute }, { name: 'clearOnEdit', transform: nullableBooleanAttribute }, 'color', { name: 'disabled', transform: nullableBooleanAttribute }, 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', { name: 'multiple', transform: nullableBooleanAttribute }, 'name', 'pattern', 'placeholder', { name: 'readonly', transform: nullableBooleanAttribute }, { name: 'required', transform: nullableBooleanAttribute }, 'size', { name: 'spellcheck', transform: nullableBooleanAttribute }, 'step', 'type', 'value'],
  outputs: ['myInput', 'myChange', 'myBlur', 'myFocus'],
})
export class MyInput {
  protected el: HTMLMyInputElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyInput['color']) {};
    /**
   * If the value of the type attribute is `"file"`, then this attribute will indicate the types of files that the server accepts, otherwise it will be ignored. The value must be a comma-separated list of unique content type specifiers.
   */
  set accept(_: Components.MyInput['accept']) {};
    /**
   * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user. @default 'off'
   */
  set autocapitalize(_: Components.MyInput['autocapitalize']) {};
    /**
   * Indicates whether the value of the control can be automatically completed by the browser. @default 'off'
   */
  set autocomplete(_: Components.MyInput['autocomplete']) {};
    /**
   * Whether auto correction should be enabled when the user is entering/editing the text value. @default 'off'
   */
  set autocorrect(_: Components.MyInput['autocorrect']) {};
    /**
   * This Boolean attribute lets you specify that a form control should have input focus when the page loads. @default false
   */
  set autofocus(_: Components.MyInput['autofocus']) {};
    /**
   * If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input. @default false
   */
  set clearInput(_: Components.MyInput['clearInput']) {};
    /**
   * If `true`, the value will be cleared after focus upon edit. Defaults to `true` when `type` is `"password"`, `false` for all other types.
   */
  set clearOnEdit(_: Components.MyInput['clearOnEdit']) {};
    /**
   * If `true`, the user cannot interact with the input. @default false
   */
  set disabled(_: Components.MyInput['disabled']) {};
    /**
   * A hint to the browser for which enter key to display.
Possible values: `"enter"`, `"done"`, `"go"`, `"next"`,
`"previous"`, `"search"`, and `"send"`.
   */
  set enterkeyhint(_: Components.MyInput['enterkeyhint']) {};
    /**
   * A hint to the browser for which keyboard to display.
Possible values: `"none"`, `"text"`, `"tel"`, `"url"`,
`"email"`, `"numeric"`, `"decimal"`, and `"search"`.
   */
  set inputmode(_: Components.MyInput['inputmode']) {};
    /**
   * The maximum value, which must not be less than its minimum (min attribute) value.
   */
  set max(_: Components.MyInput['max']) {};
    /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter.
   */
  set maxlength(_: Components.MyInput['maxlength']) {};
    /**
   * The minimum value, which must not be greater than its maximum (max attribute) value.
   */
  set min(_: Components.MyInput['min']) {};
    /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter.
   */
  set minlength(_: Components.MyInput['minlength']) {};
    /**
   * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
   */
  set multiple(_: Components.MyInput['multiple']) {};
    /**
   * The name of the control, which is submitted with the form data. @default this.inputId
   */
  set name(_: Components.MyInput['name']) {};
    /**
   * A regular expression that the value is checked against. The pattern must match the entire value, not just some subset. Use the title attribute to describe the pattern to help the user. This attribute applies when the value of the type attribute is `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, `"date"`, or `"password"`, otherwise it is ignored. When the type attribute is `"date"`, `pattern` will only be used in browsers that do not support the `"date"` input type natively. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date for more information.
   */
  set pattern(_: Components.MyInput['pattern']) {};
    /**
   * Instructional text that shows before the input has a value.
   */
  set placeholder(_: Components.MyInput['placeholder']) {};
    /**
   * If `true`, the user cannot modify the value. @default false
   */
  set readonly(_: Components.MyInput['readonly']) {};
    /**
   * If `true`, the user must fill in a value before submitting a form. @default false
   */
  set required(_: Components.MyInput['required']) {};
    /**
   * If `true`, the element will have its spelling and grammar checked. @default false
   */
  set spellcheck(_: Components.MyInput['spellcheck']) {};
    /**
   * Works with the min and max attributes to limit the increments at which a value can be set.
Possible values are: `"any"` or a positive floating point number.
   */
  set step(_: Components.MyInput['step']) {};
    /**
   * The initial size of the control. This value is in pixels unless the value of the type attribute is `"text"` or `"password"`, in which case it is an integer number of characters. This attribute applies only when the `type` attribute is set to `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, or `"password"`, otherwise it is ignored.
   */
  set size(_: Components.MyInput['size']) {};
    /**
   * The type of control to display. The default type is text. @default 'text'
   */
  set type(_: Components.MyInput['type']) {};
    /**
   * The value of the input. @default ''
   */
  set value(_: Components.MyInput['value']) {};
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
  inputs: ['accept', 'autocapitalize', 'autocomplete', 'autocorrect', { name: 'autofocus', transform: nullableBooleanAttribute }, { name: 'clearInput', transform: nullableBooleanAttribute }, { name: 'clearOnEdit', transform: nullableBooleanAttribute }, 'color', { name: 'disabled', transform: nullableBooleanAttribute }, 'enterkeyhint', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'mode', { name: 'multiple', transform: nullableBooleanAttribute }, 'name', 'pattern', 'placeholder', { name: 'readonly', transform: nullableBooleanAttribute }, { name: 'required', transform: nullableBooleanAttribute }, 'size', { name: 'spellcheck', transform: nullableBooleanAttribute }, 'step', 'type', 'value'],
  outputs: ['myInput', 'myChange', 'myBlur', 'myFocus'],
})
export class MyInputScoped {
  protected el: HTMLMyInputScopedElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyInputScoped['color']) {};
    /**
   * If the value of the type attribute is `"file"`, then this attribute will indicate the types of files that the server accepts, otherwise it will be ignored. The value must be a comma-separated list of unique content type specifiers.
   */
  set accept(_: Components.MyInputScoped['accept']) {};
    /**
   * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user. @default 'off'
   */
  set autocapitalize(_: Components.MyInputScoped['autocapitalize']) {};
    /**
   * Indicates whether the value of the control can be automatically completed by the browser. @default 'off'
   */
  set autocomplete(_: Components.MyInputScoped['autocomplete']) {};
    /**
   * Whether auto correction should be enabled when the user is entering/editing the text value. @default 'off'
   */
  set autocorrect(_: Components.MyInputScoped['autocorrect']) {};
    /**
   * This Boolean attribute lets you specify that a form control should have input focus when the page loads. @default false
   */
  set autofocus(_: Components.MyInputScoped['autofocus']) {};
    /**
   * If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input. @default false
   */
  set clearInput(_: Components.MyInputScoped['clearInput']) {};
    /**
   * If `true`, the value will be cleared after focus upon edit. Defaults to `true` when `type` is `"password"`, `false` for all other types.
   */
  set clearOnEdit(_: Components.MyInputScoped['clearOnEdit']) {};
    /**
   * If `true`, the user cannot interact with the input. @default false
   */
  set disabled(_: Components.MyInputScoped['disabled']) {};
    /**
   * A hint to the browser for which enter key to display.
Possible values: `"enter"`, `"done"`, `"go"`, `"next"`,
`"previous"`, `"search"`, and `"send"`.
   */
  set enterkeyhint(_: Components.MyInputScoped['enterkeyhint']) {};
    /**
   * A hint to the browser for which keyboard to display.
Possible values: `"none"`, `"text"`, `"tel"`, `"url"`,
`"email"`, `"numeric"`, `"decimal"`, and `"search"`.
   */
  set inputmode(_: Components.MyInputScoped['inputmode']) {};
    /**
   * The maximum value, which must not be less than its minimum (min attribute) value.
   */
  set max(_: Components.MyInputScoped['max']) {};
    /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter.
   */
  set maxlength(_: Components.MyInputScoped['maxlength']) {};
    /**
   * The minimum value, which must not be greater than its maximum (max attribute) value.
   */
  set min(_: Components.MyInputScoped['min']) {};
    /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter.
   */
  set minlength(_: Components.MyInputScoped['minlength']) {};
    /**
   * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
   */
  set multiple(_: Components.MyInputScoped['multiple']) {};
    /**
   * The name of the control, which is submitted with the form data. @default this.inputId
   */
  set name(_: Components.MyInputScoped['name']) {};
    /**
   * A regular expression that the value is checked against. The pattern must match the entire value, not just some subset. Use the title attribute to describe the pattern to help the user. This attribute applies when the value of the type attribute is `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, `"date"`, or `"password"`, otherwise it is ignored. When the type attribute is `"date"`, `pattern` will only be used in browsers that do not support the `"date"` input type natively. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date for more information.
   */
  set pattern(_: Components.MyInputScoped['pattern']) {};
    /**
   * Instructional text that shows before the input has a value.
   */
  set placeholder(_: Components.MyInputScoped['placeholder']) {};
    /**
   * If `true`, the user cannot modify the value. @default false
   */
  set readonly(_: Components.MyInputScoped['readonly']) {};
    /**
   * If `true`, the user must fill in a value before submitting a form. @default false
   */
  set required(_: Components.MyInputScoped['required']) {};
    /**
   * If `true`, the element will have its spelling and grammar checked. @default false
   */
  set spellcheck(_: Components.MyInputScoped['spellcheck']) {};
    /**
   * Works with the min and max attributes to limit the increments at which a value can be set.
Possible values are: `"any"` or a positive floating point number.
   */
  set step(_: Components.MyInputScoped['step']) {};
    /**
   * The initial size of the control. This value is in pixels unless the value of the type attribute is `"text"` or `"password"`, in which case it is an integer number of characters. This attribute applies only when the `type` attribute is set to `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, or `"password"`, otherwise it is ignored.
   */
  set size(_: Components.MyInputScoped['size']) {};
    /**
   * The type of control to display. The default type is text. @default 'text'
   */
  set type(_: Components.MyInputScoped['type']) {};
    /**
   * The value of the input. @default ''
   */
  set value(_: Components.MyInputScoped['value']) {};
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
  inputs: [{ name: 'animated', transform: nullableBooleanAttribute }, { name: 'backdropDismiss', transform: nullableBooleanAttribute }, { name: 'component', required: true }, 'componentProps', 'cssClass', 'event', { name: 'keyboardClose', transform: nullableBooleanAttribute }, 'mode', { name: 'showBackdrop', transform: nullableBooleanAttribute }, { name: 'translucent', transform: nullableBooleanAttribute }],
  outputs: ['myPopoverDidPresent', 'myPopoverWillPresent', 'myPopoverWillDismiss', 'myPopoverDidDismiss'],
})
export class MyPopover {
  protected el: HTMLMyPopoverElement;
    /**
   * The component to display inside of the popover.
   */
  set component(_: Components.MyPopover['component']) {};
    /**
   * The data to pass to the popover component.
   */
  set componentProps(_: Components.MyPopover['componentProps']) {};
    /**
   * If `true`, the keyboard will be automatically dismissed when the overlay is presented. @default true
   */
  set keyboardClose(_: Components.MyPopover['keyboardClose']) {};
    /**
   * Additional classes to apply for custom CSS. If multiple classes are
provided they should be separated by spaces.
   */
  set cssClass(_: Components.MyPopover['cssClass']) {};
    /**
   * If `true`, the popover will be dismissed when the backdrop is clicked. @default true
   */
  set backdropDismiss(_: Components.MyPopover['backdropDismiss']) {};
    /**
   * The event to pass to the popover animation.
   */
  set event(_: Components.MyPopover['event']) {};
    /**
   * If `true`, a backdrop will be displayed behind the popover. @default true
   */
  set showBackdrop(_: Components.MyPopover['showBackdrop']) {};
    /**
   * If `true`, the popover will be translucent.
Only applies when the mode is `"ios"` and the device supports
[`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility). @default false
   */
  set translucent(_: Components.MyPopover['translucent']) {};
    /**
   * If `true`, the popover will animate. @default true
   */
  set animated(_: Components.MyPopover['animated']) {};
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
  inputs: ['alignment', 'color', { name: 'disabled', transform: nullableBooleanAttribute }, 'justify', 'labelPlacement', 'mode', 'name', 'value'],
  outputs: ['ionFocus', 'ionBlur'],
})
export class MyRadio {
  protected el: HTMLMyRadioElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyRadio['color']) {};
    /**
   * The name of the control, which is submitted with the form data. @default this.inputId
   */
  set name(_: Components.MyRadio['name']) {};
    /**
   * If `true`, the user cannot interact with the radio. @default false
   */
  set disabled(_: Components.MyRadio['disabled']) {};
    /**
   * the value of the radio.
   */
  set value(_: Components.MyRadio['value']) {};
    /**
   * Where to place the label relative to the radio.
`"start"`: The label will appear to the left of the radio in LTR and to the right in RTL.
`"end"`: The label will appear to the right of the radio in LTR and to the left in RTL.
`"fixed"`: The label has the same behavior as `"start"` except it also has a fixed width. Long text will be truncated with ellipses ("...").
`"stacked"`: The label will appear above the radio regardless of the direction. The alignment of the label can be controlled with the `alignment` property. @default 'start'
   */
  set labelPlacement(_: Components.MyRadio['labelPlacement']) {};
    /**
   * How to pack the label and radio within a line.
`"start"`: The label and radio will appear on the left in LTR and
on the right in RTL.
`"end"`: The label and radio will appear on the right in LTR and
on the left in RTL.
`"space-between"`: The label and radio will appear on opposite
ends of the line with space between the two elements.
Setting this property will change the radio `display` to `block`.
   */
  set justify(_: Components.MyRadio['justify']) {};
    /**
   * How to control the alignment of the radio and label on the cross axis.
`"start"`: The label and control will appear on the left of the cross axis in LTR, and on the right side in RTL.
`"center"`: The label and control will appear at the center of the cross axis in both LTR and RTL.
Setting this property will change the radio `display` to `block`.
   */
  set alignment(_: Components.MyRadio['alignment']) {};
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
  inputs: [{ name: 'allowEmptySelection', transform: nullableBooleanAttribute }, 'compareWith', 'name', 'value'],
  outputs: ['myChange'],
})
export class MyRadioGroup {
  protected el: HTMLMyRadioGroupElement;
    /**
   * If `true`, the radios can be deselected. @default false
   */
  set allowEmptySelection(_: Components.MyRadioGroup['allowEmptySelection']) {};
    /**
   * This property allows developers to specify a custom function or property
name for comparing objects when determining the selected option in the
ion-radio-group. When not specified, the default behavior will use strict
equality (===) for comparison.
   */
  set compareWith(_: Components.MyRadioGroup['compareWith']) {};
    /**
   * The name of the control, which is submitted with the form data. @default this.inputId
   */
  set name(_: Components.MyRadioGroup['name']) {};
    /**
   * the value of the radio group.
   */
  set value(_: Components.MyRadioGroup['value']) {};
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
  inputs: ['color', 'debounce', { name: 'disabled', transform: nullableBooleanAttribute }, { name: 'dualKnobs', transform: nullableBooleanAttribute }, 'max', 'min', 'mode', 'name', { name: 'pin', transform: nullableBooleanAttribute }, { name: 'snaps', transform: nullableBooleanAttribute }, 'step', { name: 'ticks', transform: nullableBooleanAttribute }, 'value'],
  outputs: ['myChange', 'myFocus', 'myBlur'],
})
export class MyRange {
  protected el: HTMLMyRangeElement;
    /**
   * The color to use from your application's color palette.
Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
For more information on colors, see [theming](/docs/theming/basics).
   */
  set color(_: Components.MyRange['color']) {};
    /**
   * How long, in milliseconds, to wait to trigger the
`myChange` event after each change in the range value. @default 0
   */
  set debounce(_: Components.MyRange['debounce']) {};
    /**
   * The name of the control, which is submitted with the form data. @default ''
   */
  set name(_: Components.MyRange['name']) {};
    /**
   * Show two knobs. @default false
   */
  set dualKnobs(_: Components.MyRange['dualKnobs']) {};
    /**
   * Minimum integer value of the range. @default 0
   */
  set min(_: Components.MyRange['min']) {};
    /**
   * Maximum integer value of the range. @default 100
   */
  set max(_: Components.MyRange['max']) {};
    /**
   * If `true`, a pin with integer value is shown when the knob
is pressed. @default false
   */
  set pin(_: Components.MyRange['pin']) {};
    /**
   * If `true`, the knob snaps to tick marks evenly spaced based
on the step property value. @default false
   */
  set snaps(_: Components.MyRange['snaps']) {};
    /**
   * Specifies the value granularity. @default 1
   */
  set step(_: Components.MyRange['step']) {};
    /**
   * If `true`, tick marks are displayed based on the step value.
Only applies when `snaps` is `true`. @default true
   */
  set ticks(_: Components.MyRange['ticks']) {};
    /**
   * If `true`, the user cannot interact with the range. @default false
   */
  set disabled(_: Components.MyRange['disabled']) {};
    /**
   * the value of the range. @default 0
   */
  set value(_: Components.MyRange['value']) {};
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
  inputs: [{ name: 'visible', transform: nullableBooleanAttribute }],
})
export class MyToggleContent {
  protected el: HTMLMyToggleContentElement;
  
  set visible(_: Components.MyToggleContent['visible']) {};
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
    /**
   *  @default 'Transform Test Component'
   */
  set message(_: Components.MyTransformTest['message']) {};
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MyTransformTest extends Components.MyTransformTest {}


