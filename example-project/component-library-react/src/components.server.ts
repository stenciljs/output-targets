/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 * Do __not__ import components from this file as server side rendered components
 * may not hydrate due to missing Stencil runtime. Instead, import these components through the generated 'components.ts'
 * file that re-exports all components with the 'use client' directive.
 */

/* eslint-disable */

import type { EventName, StencilReactComponent } from '@stencil/react-output-target/runtime';
import { createComponent, type SerializeShadowRootOptions } from '@stencil/react-output-target/ssr';
import {
  type CheckboxChangeEventDetail,
  type IMyComponent,
  type InputChangeEventDetail,
  type MyCheckboxCustomEvent,
  type MyComponentCustomEvent,
  type MyInputCustomEvent,
  type MyPopoverCustomEvent,
  type MyRadioGroupCustomEvent,
  type MyRangeCustomEvent,
  type OverlayEventDetail,
  type RadioGroupChangeEventDetail,
  type RangeChangeEventDetail,
} from 'component-library';
import { MyButton as MyButtonElement } from 'component-library/components/my-button.js';
import { MyCheckbox as MyCheckboxElement } from 'component-library/components/my-checkbox.js';
import { MyComponent as MyComponentElement } from 'component-library/components/my-component.js';
import { MyCounter as MyCounterElement } from 'component-library/components/my-counter.js';
import { MyInput as MyInputElement } from 'component-library/components/my-input.js';
import { MyListItem as MyListItemElement } from 'component-library/components/my-list-item.js';
import { MyList as MyListElement } from 'component-library/components/my-list.js';
import { MyPopover as MyPopoverElement } from 'component-library/components/my-popover.js';
import { MyRadioGroup as MyRadioGroupElement } from 'component-library/components/my-radio-group.js';
import { MyRadio as MyRadioElement } from 'component-library/components/my-radio.js';
import { MyRange as MyRangeElement } from 'component-library/components/my-range.js';
import { MyToggleContent as MyToggleContentElement } from 'component-library/components/my-toggle-content.js';
import { MyToggle as MyToggleElement } from 'component-library/components/my-toggle.js';

export const serializeShadowRoot: SerializeShadowRootOptions = {
  scoped: ['my-counter'],
  default: 'declarative-shadow-dom',
};

export type MyButtonEvents = {
  onMyFocus: EventName<CustomEvent<void>>;
  onMyBlur: EventName<CustomEvent<void>>;
};

export const MyButton: StencilReactComponent<MyButtonElement, MyButtonEvents> = /*@__PURE__*/ createComponent<
  MyButtonElement,
  MyButtonEvents
>({
  tagName: 'my-button',
  properties: {
    color: 'color',
    buttonType: 'button-type',
    disabled: 'disabled',
    expand: 'expand',
    fill: 'fill',
    download: 'download',
    href: 'href',
    rel: 'rel',
    shape: 'shape',
    size: 'size',
    strong: 'strong',
    target: 'target',
    type: 'type',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyCheckboxEvents = {
  onIonChange: EventName<MyCheckboxCustomEvent<CheckboxChangeEventDetail>>;
  onIonFocus: EventName<CustomEvent<void>>;
  onIonBlur: EventName<CustomEvent<void>>;
};

export const MyCheckbox: StencilReactComponent<MyCheckboxElement, MyCheckboxEvents> = /*@__PURE__*/ createComponent<
  MyCheckboxElement,
  MyCheckboxEvents
>({
  tagName: 'my-checkbox',
  properties: {
    color: 'color',
    name: 'name',
    checked: 'checked',
    indeterminate: 'indeterminate',
    disabled: 'disabled',
    value: 'value',
    labelPlacement: 'label-placement',
    justify: 'justify',
    alignment: 'alignment',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyComponentEvents = {
  onMyCustomEvent: EventName<MyComponentCustomEvent<IMyComponent.someVar>>;
  onMyCustomNestedEvent: EventName<MyComponentCustomEvent<IMyComponent.SomeMoreComplexType.SubType>>;
};

export const MyComponent: StencilReactComponent<MyComponentElement, MyComponentEvents> = /*@__PURE__*/ createComponent<
  MyComponentElement,
  MyComponentEvents
>({
  tagName: 'my-component',
  properties: {
    first: 'first',
    middle: 'middle',
    last: 'last',
    age: 'age',
    favoriteKidName: 'favorite-kid-name',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyCounterEvents = { onCount: EventName<CustomEvent<number>> };

export const MyCounter: StencilReactComponent<MyCounterElement, MyCounterEvents> = /*@__PURE__*/ createComponent<
  MyCounterElement,
  MyCounterEvents
>({
  tagName: 'my-counter',
  properties: { startValue: 'start-value' },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyInputEvents = {
  onMyInput: EventName<MyInputCustomEvent<KeyboardEvent>>;
  onMyChange: EventName<MyInputCustomEvent<InputChangeEventDetail>>;
  onMyBlur: EventName<CustomEvent<void>>;
  onMyFocus: EventName<CustomEvent<void>>;
};

export const MyInput: StencilReactComponent<MyInputElement, MyInputEvents> = /*@__PURE__*/ createComponent<
  MyInputElement,
  MyInputEvents
>({
  tagName: 'my-input',
  properties: {
    color: 'color',
    accept: 'accept',
    autocapitalize: 'autocapitalize',
    autocomplete: 'autocomplete',
    autocorrect: 'autocorrect',
    autofocus: 'autofocus',
    clearInput: 'clear-input',
    clearOnEdit: 'clear-on-edit',
    disabled: 'disabled',
    enterkeyhint: 'enterkeyhint',
    inputmode: 'inputmode',
    max: 'max',
    maxlength: 'maxlength',
    min: 'min',
    minlength: 'minlength',
    multiple: 'multiple',
    name: 'name',
    pattern: 'pattern',
    placeholder: 'placeholder',
    readonly: 'readonly',
    required: 'required',
    spellcheck: 'spellcheck',
    step: 'step',
    size: 'size',
    type: 'type',
    value: 'value',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyListEvents = NonNullable<unknown>;

export const MyList: StencilReactComponent<MyListElement, MyListEvents> = /*@__PURE__*/ createComponent<
  MyListElement,
  MyListEvents
>({
  tagName: 'my-list',
  properties: {},
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyListItemEvents = NonNullable<unknown>;

export const MyListItem: StencilReactComponent<MyListItemElement, MyListItemEvents> = /*@__PURE__*/ createComponent<
  MyListItemElement,
  MyListItemEvents
>({
  tagName: 'my-list-item',
  properties: {},
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyPopoverEvents = {
  onMyPopoverDidPresent: EventName<CustomEvent<void>>;
  onMyPopoverWillPresent: EventName<CustomEvent<void>>;
  onMyPopoverWillDismiss: EventName<MyPopoverCustomEvent<OverlayEventDetail>>;
  onMyPopoverDidDismiss: EventName<MyPopoverCustomEvent<OverlayEventDetail>>;
};

export const MyPopover: StencilReactComponent<MyPopoverElement, MyPopoverEvents> = /*@__PURE__*/ createComponent<
  MyPopoverElement,
  MyPopoverEvents
>({
  tagName: 'my-popover',
  properties: {
    component: 'component',
    keyboardClose: 'keyboard-close',
    cssClass: 'css-class',
    backdropDismiss: 'backdrop-dismiss',
    event: 'event',
    showBackdrop: 'show-backdrop',
    translucent: 'translucent',
    animated: 'animated',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyRadioEvents = {
  onIonFocus: EventName<CustomEvent<void>>;
  onIonBlur: EventName<CustomEvent<void>>;
};

export const MyRadio: StencilReactComponent<MyRadioElement, MyRadioEvents> = /*@__PURE__*/ createComponent<
  MyRadioElement,
  MyRadioEvents
>({
  tagName: 'my-radio',
  properties: {
    color: 'color',
    name: 'name',
    disabled: 'disabled',
    value: 'value',
    labelPlacement: 'label-placement',
    justify: 'justify',
    alignment: 'alignment',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyRadioGroupEvents = { onMyChange: EventName<MyRadioGroupCustomEvent<RadioGroupChangeEventDetail>> };

export const MyRadioGroup: StencilReactComponent<MyRadioGroupElement, MyRadioGroupEvents> =
  /*@__PURE__*/ createComponent<MyRadioGroupElement, MyRadioGroupEvents>({
    tagName: 'my-radio-group',
    properties: {
      allowEmptySelection: 'allow-empty-selection',
      compareWith: 'compare-with',
      name: 'name',
      value: 'value',
    },
    hydrateModule: import('component-library/hydrate'),
    serializeShadowRoot,
  });

export type MyRangeEvents = {
  onMyChange: EventName<MyRangeCustomEvent<RangeChangeEventDetail>>;
  onMyFocus: EventName<CustomEvent<void>>;
  onMyBlur: EventName<CustomEvent<void>>;
};

export const MyRange: StencilReactComponent<MyRangeElement, MyRangeEvents> = /*@__PURE__*/ createComponent<
  MyRangeElement,
  MyRangeEvents
>({
  tagName: 'my-range',
  properties: {
    color: 'color',
    debounce: 'debounce',
    name: 'name',
    dualKnobs: 'dual-knobs',
    min: 'min',
    max: 'max',
    pin: 'pin',
    snaps: 'snaps',
    step: 'step',
    ticks: 'ticks',
    disabled: 'disabled',
    value: 'value',
  },
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyToggleEvents = NonNullable<unknown>;

export const MyToggle: StencilReactComponent<MyToggleElement, MyToggleEvents> = /*@__PURE__*/ createComponent<
  MyToggleElement,
  MyToggleEvents
>({
  tagName: 'my-toggle',
  properties: {},
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot,
});

export type MyToggleContentEvents = NonNullable<unknown>;

export const MyToggleContent: StencilReactComponent<MyToggleContentElement, MyToggleContentEvents> =
  /*@__PURE__*/ createComponent<MyToggleContentElement, MyToggleContentEvents>({
    tagName: 'my-toggle-content',
    properties: { visible: 'visible' },
    hydrateModule: import('component-library/hydrate'),
    serializeShadowRoot,
  });
