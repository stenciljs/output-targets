import { EventEmitter } from '@stencil/core';

// From: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
export type AutocompleteTypes =
  | 'on'
  | 'off'
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level4'
  | 'address-level3'
  | 'address-level2'
  | 'address-level1'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type'
  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-extension'
  | 'impp'
  | 'url'
  | 'photo';

export type TextFieldTypes = 'date' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | 'time';
export type Side = 'start' | 'end';
export type PredefinedColors =
  'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

export interface StyleEventDetail {
  [styleName: string]: boolean;
}

export type Color = PredefinedColors | string;
export type Mode = 'ios' | 'md';
export type ComponentTags = string;
export type ComponentRef = Function | HTMLElement | string | null;
export type ComponentProps<T = null> = { [key: string]: any };
export type CssClassMap = { [className: string]: boolean };

export interface OverlayInterface {
  el: HTMLElement;
  animated: boolean;
  keyboardClose: boolean;
  overlayIndex: number;
  presented: boolean;

  didPresent: EventEmitter<void>;
  willPresent: EventEmitter<void>;
  willDismiss: EventEmitter<OverlayEventDetail>;
  didDismiss: EventEmitter<OverlayEventDetail>;

  present(): Promise<void>;
  dismiss(data?: any, role?: string): Promise<boolean>;
}

export interface OverlayEventDetail<T = any> {
  data?: T;
  role?: string;
}
