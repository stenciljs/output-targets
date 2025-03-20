/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer, defineStencilSSRComponent, type StencilVueComponent } from '@stencil/vue-output-target/runtime';

import type { JSX } from 'component-library';

import { defineCustomElement as defineMyButton } from 'component-library/components/my-button.js';
import { defineCustomElement as defineMyCheckbox } from 'component-library/components/my-checkbox.js';
import { defineCustomElement as defineMyComplexProps } from 'component-library/components/my-complex-props.js';
import { defineCustomElement as defineMyComponent } from 'component-library/components/my-component.js';
import { defineCustomElement as defineMyCounter } from 'component-library/components/my-counter.js';
import { defineCustomElement as defineMyInput } from 'component-library/components/my-input.js';
import { defineCustomElement as defineMyList } from 'component-library/components/my-list.js';
import { defineCustomElement as defineMyListItem } from 'component-library/components/my-list-item.js';
import { defineCustomElement as defineMyPopover } from 'component-library/components/my-popover.js';
import { defineCustomElement as defineMyRadio } from 'component-library/components/my-radio.js';
import { defineCustomElement as defineMyRadioGroup } from 'component-library/components/my-radio-group.js';
import { defineCustomElement as defineMyRange } from 'component-library/components/my-range.js';
import { defineCustomElement as defineMyToggle } from 'component-library/components/my-toggle.js';
import { defineCustomElement as defineMyToggleContent } from 'component-library/components/my-toggle-content.js';


export const MyButton: StencilVueComponent<JSX.MyButton> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyButton>('my-button', defineMyButton, [
  'color',
  'buttonType',
  'disabled',
  'expand',
  'fill',
  'download',
  'href',
  'rel',
  'shape',
  'size',
  'strong',
  'target',
  'type',
  'myFocus',
  'myBlur'
], [
  'myFocus',
  'myBlur'
]) : defineStencilSSRComponent<JSX.MyButton>({
  tagName: 'my-button',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'color': [String, "color"],
    'buttonType': [String, "button-type"],
    'disabled': [Boolean, "disabled"],
    'expand': [String, "expand"],
    'fill': [String, "fill"],
    'download': [String, "download"],
    'href': [String, "href"],
    'rel': [String, "rel"],
    'shape': [String, "shape"],
    'size': [String, "size"],
    'strong': [Boolean, "strong"],
    'target': [String, "target"],
    'type': [String, "type"],
    'onMyFocus': [Function],
    'onMyBlur': [Function]
  }
});


export const MyCheckbox: StencilVueComponent<JSX.MyCheckbox, JSX.MyCheckbox["checked"]> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyCheckbox, JSX.MyCheckbox["checked"]>('my-checkbox', defineMyCheckbox, [
  'color',
  'name',
  'checked',
  'indeterminate',
  'disabled',
  'value',
  'labelPlacement',
  'justify',
  'alignment',
  'ionChange',
  'ionFocus',
  'ionBlur'
], [
  'ionChange',
  'ionFocus',
  'ionBlur'
],
'checked', 'myChange') : defineStencilSSRComponent<JSX.MyCheckbox, JSX.MyCheckbox["checked"]>({
  tagName: 'my-checkbox',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'color': [String, "color"],
    'name': [String, "name"],
    'checked': [Boolean, "checked"],
    'indeterminate': [Boolean, "indeterminate"],
    'disabled': [Boolean, "disabled"],
    'labelPlacement': [String, "label-placement"],
    'justify': [String, "justify"],
    'alignment': [String, "alignment"],
    'onIonChange': [Function],
    'onIonFocus': [Function],
    'onIonBlur': [Function]
  }
});


export const MyComplexProps: StencilVueComponent<JSX.MyComplexProps> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyComplexProps>('my-complex-props', defineMyComplexProps, [
  'foo',
  'baz',
  'quux',
  'grault',
  'waldo'
]) : defineStencilSSRComponent<JSX.MyComplexProps>({
  tagName: 'my-complex-props',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'grault': [Number, "grault"]
  }
});


export const MyComponent: StencilVueComponent<JSX.MyComponent> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyComponent>('my-component', defineMyComponent, [
  'first',
  'middle',
  'last',
  'age',
  'kidsNames',
  'favoriteKidName',
  'myCustomEvent',
  'myCustomNestedEvent'
], [
  'myCustomEvent',
  'myCustomNestedEvent'
]) : defineStencilSSRComponent<JSX.MyComponent>({
  tagName: 'my-component',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'first': [String, "first"],
    'middle': [String, "middle"],
    'last': [String, "last"],
    'age': [Number, "age"],
    'favoriteKidName': [String, "favorite-kid-name"],
    'onMyCustomEvent': [Function],
    'onMyCustomNestedEvent': [Function]
  }
});


export const MyCounter: StencilVueComponent<JSX.MyCounter> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyCounter>('my-counter', defineMyCounter, [
  'startValue',
  'count'
], [
  'count'
]) : defineStencilSSRComponent<JSX.MyCounter>({
  tagName: 'my-counter',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'startValue': [String, "start-value"],
    'onCount': [Function]
  }
});


export const MyInput: StencilVueComponent<JSX.MyInput, JSX.MyInput["value"]> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyInput, JSX.MyInput["value"]>('my-input', defineMyInput, [
  'color',
  'accept',
  'autocapitalize',
  'autocomplete',
  'autocorrect',
  'autofocus',
  'clearInput',
  'clearOnEdit',
  'disabled',
  'enterkeyhint',
  'inputmode',
  'max',
  'maxlength',
  'min',
  'minlength',
  'multiple',
  'name',
  'pattern',
  'placeholder',
  'readonly',
  'required',
  'spellcheck',
  'step',
  'size',
  'type',
  'value',
  'myInput',
  'myChange',
  'myBlur',
  'myFocus'
], [
  'myInput',
  'myChange',
  'myBlur',
  'myFocus'
],
'value', 'myChange') : defineStencilSSRComponent<JSX.MyInput, JSX.MyInput["value"]>({
  tagName: 'my-input',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'color': [String, "color"],
    'accept': [String, "accept"],
    'autocapitalize': [String, "autocapitalize"],
    'autocomplete': [String, "autocomplete"],
    'autocorrect': [String, "autocorrect"],
    'autofocus': [Boolean, "autofocus"],
    'clearInput': [Boolean, "clear-input"],
    'clearOnEdit': [Boolean, "clear-on-edit"],
    'disabled': [Boolean, "disabled"],
    'enterkeyhint': [String, "enterkeyhint"],
    'inputmode': [String, "inputmode"],
    'max': [String, "max"],
    'maxlength': [Number, "maxlength"],
    'min': [String, "min"],
    'minlength': [Number, "minlength"],
    'multiple': [Boolean, "multiple"],
    'name': [String, "name"],
    'pattern': [String, "pattern"],
    'placeholder': [String, "placeholder"],
    'readonly': [Boolean, "readonly"],
    'required': [Boolean, "required"],
    'spellcheck': [Boolean, "spellcheck"],
    'step': [String, "step"],
    'size': [Number, "size"],
    'type': [String, "type"],
    'onMyInput': [Function],
    'onMyChange': [Function],
    'onMyBlur': [Function],
    'onMyFocus': [Function]
  }
});


export const MyList: StencilVueComponent<JSX.MyList> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyList>('my-list', defineMyList) : defineStencilSSRComponent<JSX.MyList>({
  tagName: 'my-list',
  hydrateModule: import('component-library/hydrate'),
  props: {
    
  }
});


export const MyListItem: StencilVueComponent<JSX.MyListItem> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyListItem>('my-list-item', defineMyListItem) : defineStencilSSRComponent<JSX.MyListItem>({
  tagName: 'my-list-item',
  hydrateModule: import('component-library/hydrate'),
  props: {
    
  }
});


export const MyPopover: StencilVueComponent<JSX.MyPopover> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyPopover>('my-popover', defineMyPopover, [
  'component',
  'componentProps',
  'keyboardClose',
  'cssClass',
  'backdropDismiss',
  'event',
  'showBackdrop',
  'translucent',
  'animated',
  'myPopoverDidPresent',
  'myPopoverWillPresent',
  'myPopoverWillDismiss',
  'myPopoverDidDismiss'
], [
  'myPopoverDidPresent',
  'myPopoverWillPresent',
  'myPopoverWillDismiss',
  'myPopoverDidDismiss'
]) : defineStencilSSRComponent<JSX.MyPopover>({
  tagName: 'my-popover',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'component': [String, "component"],
    'keyboardClose': [Boolean, "keyboard-close"],
    'cssClass': [String, "css-class"],
    'backdropDismiss': [Boolean, "backdrop-dismiss"],
    'showBackdrop': [Boolean, "show-backdrop"],
    'translucent': [Boolean, "translucent"],
    'animated': [Boolean, "animated"],
    'onMyPopoverDidPresent': [Function],
    'onMyPopoverWillPresent': [Function],
    'onMyPopoverWillDismiss': [Function],
    'onMyPopoverDidDismiss': [Function]
  }
});


export const MyRadio: StencilVueComponent<JSX.MyRadio> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyRadio>('my-radio', defineMyRadio, [
  'color',
  'name',
  'disabled',
  'value',
  'labelPlacement',
  'justify',
  'alignment',
  'ionFocus',
  'ionBlur'
], [
  'ionFocus',
  'ionBlur'
]) : defineStencilSSRComponent<JSX.MyRadio>({
  tagName: 'my-radio',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'color': [String, "color"],
    'name': [String, "name"],
    'disabled': [Boolean, "disabled"],
    'labelPlacement': [String, "label-placement"],
    'justify': [String, "justify"],
    'alignment': [String, "alignment"],
    'onIonFocus': [Function],
    'onIonBlur': [Function]
  }
});


export const MyRadioGroup: StencilVueComponent<JSX.MyRadioGroup, JSX.MyRadioGroup["value"]> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyRadioGroup, JSX.MyRadioGroup["value"]>('my-radio-group', defineMyRadioGroup, [
  'allowEmptySelection',
  'compareWith',
  'name',
  'value',
  'myChange',
  'myValueChange'
], [
  'myChange',
  'myValueChange'
],
'value', 'myChange') : defineStencilSSRComponent<JSX.MyRadioGroup, JSX.MyRadioGroup["value"]>({
  tagName: 'my-radio-group',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'allowEmptySelection': [Boolean, "allow-empty-selection"],
    'compareWith': [String, "compare-with"],
    'name': [String, "name"],
    'onMyChange': [Function],
    'onMyValueChange': [Function]
  }
});


export const MyRange: StencilVueComponent<JSX.MyRange, JSX.MyRange["value"]> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyRange, JSX.MyRange["value"]>('my-range', defineMyRange, [
  'color',
  'debounce',
  'name',
  'dualKnobs',
  'min',
  'max',
  'pin',
  'snaps',
  'step',
  'ticks',
  'disabled',
  'value',
  'myChange',
  'myStyle',
  'myFocus',
  'myBlur'
], [
  'myChange',
  'myStyle',
  'myFocus',
  'myBlur'
],
'value', 'myChange') : defineStencilSSRComponent<JSX.MyRange, JSX.MyRange["value"]>({
  tagName: 'my-range',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'color': [String, "color"],
    'debounce': [Number, "debounce"],
    'name': [String, "name"],
    'dualKnobs': [Boolean, "dual-knobs"],
    'min': [Number, "min"],
    'max': [Number, "max"],
    'pin': [Boolean, "pin"],
    'snaps': [Boolean, "snaps"],
    'step': [Number, "step"],
    'ticks': [Boolean, "ticks"],
    'disabled': [Boolean, "disabled"],
    'value': [Number, "value"],
    'onMyChange': [Function],
    'onMyStyle': [Function],
    'onMyFocus': [Function],
    'onMyBlur': [Function]
  }
});


export const MyToggle: StencilVueComponent<JSX.MyToggle> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyToggle>('my-toggle', defineMyToggle) : defineStencilSSRComponent<JSX.MyToggle>({
  tagName: 'my-toggle',
  hydrateModule: import('component-library/hydrate'),
  props: {
    
  }
});


export const MyToggleContent: StencilVueComponent<JSX.MyToggleContent> = /*@__PURE__*/ globalThis.window ? defineContainer<JSX.MyToggleContent>('my-toggle-content', defineMyToggleContent, [
  'visible'
]) : defineStencilSSRComponent<JSX.MyToggleContent>({
  tagName: 'my-toggle-content',
  hydrateModule: import('component-library/hydrate'),
  props: {
    'visible': [Boolean, "visible"]
  }
});

