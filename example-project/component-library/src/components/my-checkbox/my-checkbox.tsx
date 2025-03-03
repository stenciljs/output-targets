import type { ComponentInterface, EventEmitter } from '@stencil/core';
import { Component, Element, Event, Host, Method, Prop, h } from '@stencil/core';

export interface CheckboxChangeEventDetail<T = any> {
  value: T;
  checked: boolean;
}

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - The label text to associate with the checkbox. Use the "labelPlacement" property to control where the label is placed relative to the checkbox.
 *
 * @part container - The container for the checkbox mark.
 * @part label - The label text describing the checkbox.
 * @part mark - The checkmark used to indicate the checked state.
 */
@Component({
  tag: 'my-checkbox',
  styleUrl: 'checkbox.md.scss',
  shadow: true,
})
export class Checkbox implements ComponentInterface {
  private inputId = `ion-cb-${checkboxIds++}`;
  private focusEl?: HTMLElement;
  private inheritedAttributes: Record<string, string> = {};

  @Element() el!: HTMLElement;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop({ reflect: true }) color?: string;

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * If `true`, the checkbox is selected.
   */
  @Prop({ mutable: true }) checked = false;

  /**
   * If `true`, the checkbox will visually appear as indeterminate.
   */
  @Prop({ mutable: true }) indeterminate = false;

  /**
   * If `true`, the user cannot interact with the checkbox.
   */
  @Prop() disabled = false;

  /**
   * The value of the checkbox does not mean if it's checked or not, use the `checked`
   * property for that.
   *
   * The value of a checkbox is analogous to the value of an `<input type="checkbox">`,
   * it's only used when the checkbox participates in a native `<form>`.
   */
  @Prop() value: any | null = 'on';

  /**
   * Where to place the label relative to the checkbox.
   * `"start"`: The label will appear to the left of the checkbox in LTR and to the right in RTL.
   * `"end"`: The label will appear to the right of the checkbox in LTR and to the left in RTL.
   * `"fixed"`: The label has the same behavior as `"start"` except it also has a fixed width. Long text will be truncated with ellipses ("...").
   * `"stacked"`: The label will appear above the checkbox regardless of the direction. The alignment of the label can be controlled with the `alignment` property.
   */
  @Prop() labelPlacement: 'start' | 'end' | 'fixed' | 'stacked' = 'start';

  /**
   * How to pack the label and checkbox within a line.
   * `"start"`: The label and checkbox will appear on the left in LTR and
   * on the right in RTL.
   * `"end"`: The label and checkbox will appear on the right in LTR and
   * on the left in RTL.
   * `"space-between"`: The label and checkbox will appear on opposite
   * ends of the line with space between the two elements.
   * Setting this property will change the checkbox `display` to `block`.
   */
  @Prop() justify?: 'start' | 'end' | 'space-between';

  /**
   * How to control the alignment of the checkbox and label on the cross axis.
   * `"start"`: The label and control will appear on the left of the cross axis in LTR, and on the right side in RTL.
   * `"center"`: The label and control will appear at the center of the cross axis in both LTR and RTL.
   * Setting this property will change the checkbox `display` to `block`.
   */
  @Prop() alignment?: 'start' | 'center';

  /**
   * Emitted when the checked property has changed as a result of a user action such as a click.
   *
   * This event will not emit when programmatically setting the `checked` property.
   */
  @Event() ionChange!: EventEmitter<CheckboxChangeEventDetail>;

  /**
   * Emitted when the checkbox has focus.
   */
  @Event() ionFocus!: EventEmitter<void>;

  /**
   * Emitted when the checkbox loses focus.
   */
  @Event() ionBlur!: EventEmitter<void>;

  componentWillLoad() {
    this.inheritedAttributes = {};
  }

  /** @internal */
  @Method()
  async setFocus() {
    if (this.focusEl) {
      this.focusEl.focus();
    }
  }

  /**
   * Sets the checked property and emits
   * the ionChange event. Use this to update the
   * checked state in response to user-generated
   * actions such as a click.
   */
  private setChecked = (state: boolean) => {
    const isChecked = (this.checked = state);
    this.ionChange.emit({
      checked: isChecked,
      value: this.value,
    });
  };

  private toggleChecked = (ev: Event) => {
    ev.preventDefault();

    this.setFocus();
    this.setChecked(!this.checked);
    this.indeterminate = false;
  };

  private onFocus = () => {
    this.ionFocus.emit();
  };

  private onBlur = () => {
    this.ionBlur.emit();
  };

  private onClick = (ev: MouseEvent) => {
    if (this.disabled) {
      return;
    }

    this.toggleChecked(ev);
  };

  render() {
    const {
      color,
      checked,
      disabled,
      el,
      getSVGPath,
      indeterminate,
      inheritedAttributes,
      inputId,
      justify,
      labelPlacement,
      name,
      value,
      alignment,
    } = this;
    const mode = 'ios';
    const path = getSVGPath(mode, indeterminate);

    renderHiddenInput(true, el, name, checked ? value : '', disabled);

    return (
      <Host
        aria-checked={indeterminate ? 'mixed' : `${checked}`}
        class={createColorClasses(color, {
          [mode]: true,
          'in-item': hostContext('ion-item', el),
          'checkbox-checked': checked,
          'checkbox-disabled': disabled,
          'checkbox-indeterminate': indeterminate,
          interactive: true,
          [`checkbox-justify-${justify}`]: justify !== undefined,
          [`checkbox-alignment-${alignment}`]: alignment !== undefined,
          [`checkbox-label-placement-${labelPlacement}`]: true,
        })}
        onClick={this.onClick}
      >
        <label class="checkbox-wrapper">
          {/*
            The native control must be rendered
            before the visible label text due to https://bugs.webkit.org/show_bug.cgi?id=251951
          */}
          <input
            type="checkbox"
            checked={checked ? true : undefined}
            disabled={disabled}
            id={inputId}
            onChange={this.toggleChecked}
            onFocus={() => this.onFocus()}
            onBlur={() => this.onBlur()}
            ref={(focusEl) => (this.focusEl = focusEl)}
            {...inheritedAttributes}
          />
          <div
            class={{
              'label-text-wrapper': true,
              'label-text-wrapper-hidden': el.textContent === '',
            }}
            part="label"
          >
            <slot></slot>
          </div>
          <div class="native-wrapper">
            <svg class="checkbox-icon" viewBox="0 0 24 24" part="container">
              {path}
            </svg>
          </div>
        </label>
      </Host>
    );
  }

  private getSVGPath(mode: any, indeterminate: boolean): HTMLElement {
    let path = indeterminate ? (
      <path d="M6 12L18 12" part="mark" />
    ) : (
      <path d="M5.9,12.5l3.8,3.8l8.8-8.8" part="mark" />
    );

    if (mode === 'md') {
      path = indeterminate ? (
        <path d="M2 12H22" part="mark" />
      ) : (
        <path d="M1.73,12.91 8.1,19.28 22.79,4.59" part="mark" />
      );
    }

    return path;
  }
}

let checkboxIds = 0;

const hostContext = (selector: string, el: HTMLElement): boolean => {
  return el.closest(selector) !== null;
}

const hasShadowDom = (el: HTMLElement) => {
  return !!el.shadowRoot && !!(el as any).attachShadow;
};

const createColorClasses = (color: string | undefined | null, cssClassMap: any): any => {
  return typeof color === 'string' && color.length > 0
    ? {
        'ion-color': true,
        [`ion-color-${color}`]: true,
        ...cssClassMap,
      }
    : cssClassMap;
};

/**
 * This method is used to add a hidden input to a host element that contains
 * a Shadow DOM. It does not add the input inside of the Shadow root which
 * allows it to be picked up inside of forms. It should contain the same
 * values as the host element.
 *
 * @param always Add a hidden input even if the container does not use Shadow
 * @param container The element where the input will be added
 * @param name The name of the input
 * @param value The value of the input
 * @param disabled If true, the input is disabled
 */
const renderHiddenInput = (
  always: boolean,
  container: HTMLElement,
  name: string,
  value: string | undefined | null,
  disabled: boolean
) => {
  if (always || hasShadowDom(container)) {
    let input = container.querySelector('input.aux-input') as HTMLInputElement | null;
    if (!input) {
      input = container.ownerDocument!.createElement('input');
      input.type = 'hidden';
      input.classList.add('aux-input');
      container.appendChild(input);
    }
    input.disabled = disabled;
    input.name = name;
    input.value = value || '';
  }
};
