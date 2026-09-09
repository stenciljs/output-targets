export interface AnchorInterface {
  href: string | undefined;
  target: string | undefined;
  rel: string | undefined;
  download: string | undefined;
}

export interface ButtonInterface {
  type: 'submit' | 'reset' | 'button';
  disabled: boolean;
}

export type PredefinedColors =
  'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
export type Color = PredefinedColors | string;

export interface StyleEventDetail {
  [styleName: string]: boolean;
}

export interface CheckboxChangeEventDetail {
  value: any;
  checked: boolean;
}
