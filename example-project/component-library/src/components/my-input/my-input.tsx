import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';

import { AutocompleteTypes, Color, TextFieldTypes } from '../../interfaces';

export interface InputChangeEventDetail {
  value: string | number | undefined | null;
}

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
@Component({
  tag: 'my-input',
  shadow: true,
})
export class MyInput implements ComponentInterface {
  private nativeInput?: HTMLInputElement;
  private inputId = `my-input-${inputIds++}`;
  private didBlurAfterEdit = false;
  private tabindex?: string | number;

  @State() hasFocus = false;

  @Element() el!: HTMLElement;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop() color?: Color;

  /**
   * If the value of the type attribute is `"file"`, then this attribute will indicate the types of files that the server accepts, otherwise it will be ignored. The value must be a comma-separated list of unique content type specifiers.
   */
  @Prop() accept?: string;

  /**
   * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.
   */
  @Prop() autocapitalize = 'off';

  /**
   * Indicates whether the value of the control can be automatically completed by the browser.
   */
  @Prop() autocomplete: AutocompleteTypes = 'off';

  /**
   * Whether auto correction should be enabled when the user is entering/editing the text value.
   */
  @Prop() autocorrect: 'on' | 'off' = 'off';

  /**
   * This Boolean attribute lets you specify that a form control should have input focus when the page loads.
   */
  @Prop() autofocus = false;

  /**
   * If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input.
   */
  @Prop() clearInput = false;

  /**
   * If `true`, the value will be cleared after focus upon edit. Defaults to `true` when `type` is `"password"`, `false` for all other types.
   */
  @Prop() clearOnEdit?: boolean;

  /**
   * If `true`, the user cannot interact with the input.
   */
  @Prop() disabled = false;

  /**
   * A hint to the browser for which enter key to display.
   * Possible values: `"enter"`, `"done"`, `"go"`, `"next"`,
   * `"previous"`, `"search"`, and `"send"`.
   */
  @Prop() enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /**
   * A hint to the browser for which keyboard to display.
   * Possible values: `"none"`, `"text"`, `"tel"`, `"url"`,
   * `"email"`, `"numeric"`, `"decimal"`, and `"search"`.
   */
  @Prop() inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

  /**
   * The maximum value, which must not be less than its minimum (min attribute) value.
   */
  @Prop() max?: string;

  /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter.
   */
  @Prop() maxlength?: number;

  /**
   * The minimum value, which must not be greater than its maximum (max attribute) value.
   */
  @Prop() min?: string;

  /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter.
   */
  @Prop() minlength?: number;

  /**
   * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
   */
  @Prop() multiple?: boolean;

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * A regular expression that the value is checked against. The pattern must match the entire value, not just some subset. Use the title attribute to describe the pattern to help the user. This attribute applies when the value of the type attribute is `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, `"date"`, or `"password"`, otherwise it is ignored. When the type attribute is `"date"`, `pattern` will only be used in browsers that do not support the `"date"` input type natively. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date for more information.
   */
  @Prop() pattern?: string;

  /**
   * Instructional text that shows before the input has a value.
   */
  @Prop() placeholder?: string | null;

  /**
   * If `true`, the user cannot modify the value.
   */
  @Prop() readonly = false;

  /**
   * If `true`, the user must fill in a value before submitting a form.
   */
  @Prop() required = false;

  /**
   * If `true`, the element will have its spelling and grammar checked.
   */
  @Prop() spellcheck = false;

  /**
   * Works with the min and max attributes to limit the increments at which a value can be set.
   * Possible values are: `"any"` or a positive floating point number.
   */
  @Prop() step?: string;

  /**
   * The initial size of the control. This value is in pixels unless the value of the type attribute is `"text"` or `"password"`, in which case it is an integer number of characters. This attribute applies only when the `type` attribute is set to `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, or `"password"`, otherwise it is ignored.
   */
  @Prop() size?: number;

  /**
   * The type of control to display. The default type is text.
   */
  @Prop() type: TextFieldTypes = 'text';

  /**
   * The value of the input.
   */
  @Prop({ mutable: true }) value?: string | number | null = '';

  /**
   * Update the native input element when the value changes
   */
  @Watch('value')
  protected valueChanged() {
    this.myChange.emit({ value: this.value == null ? this.value : this.value.toString() });
  }

  /**
   * Emitted when a keyboard input occurred.
   */
  @Event() myInput!: EventEmitter<KeyboardEvent>;

  /**
   * Emitted when the value has changed.
   */
  @Event() myChange!: EventEmitter<InputChangeEventDetail>;

  /**
   * Emitted when the input loses focus.
   */
  @Event() myBlur!: EventEmitter<void>;

  /**
   * Emitted when the input has focus.
   */
  @Event() myFocus!: EventEmitter<void>;

  componentWillLoad() {
    // If the my-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // my-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.el.removeAttribute('tabindex');
    }
  }

  /**
   * Sets focus on the specified `my-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeInput) {
      this.nativeInput.focus();
    }
  }

  /**
   * Returns the native `<input>` element used under the hood.
   */
  @Method()
  getInputElement(): Promise<HTMLInputElement> {
    return Promise.resolve(this.nativeInput!);
  }

  private shouldClearOnEdit() {
    const { type, clearOnEdit } = this;
    return clearOnEdit === undefined ? type === 'password' : clearOnEdit;
  }

  private getValue(): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString();
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | null;
    if (input) {
      this.value = input.value || '';
    }
    this.myInput.emit(ev as KeyboardEvent);
  };

  private onBlur = () => {
    this.hasFocus = false;
    this.focusChanged();

    this.myBlur.emit();
  };

  private onFocus = () => {
    this.hasFocus = true;
    this.focusChanged();

    this.myFocus.emit();
  };

  private onKeydown = (ev: KeyboardEvent) => {
    if (this.shouldClearOnEdit()) {
      // Did the input value change after it was blurred and edited?
      // Do not clear if user is hitting Enter to submit form
      if (this.didBlurAfterEdit && this.hasValue() && ev.key !== 'Enter') {
        // Clear the input
        this.clearTextInput();
      }

      // Reset the flag
      this.didBlurAfterEdit = false;
    }
  };

  private clearTextInput = (ev?: Event) => {
    if (this.clearInput && !this.readonly && !this.disabled && ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    this.value = '';

    /**
     * This is needed for clearOnEdit
     * Otherwise the value will not be cleared
     * if user is inside the input
     */
    if (this.nativeInput) {
      this.nativeInput.value = '';
    }
  };

  private focusChanged() {
    // If clearOnEdit is enabled and the input blurred but has a value, set a flag
    if (!this.hasFocus && this.shouldClearOnEdit() && this.hasValue()) {
      this.didBlurAfterEdit = true;
    }
  }

  private hasValue(): boolean {
    return this.getValue().length > 0;
  }

  render() {
    const value = this.getValue();
    const labelId = this.inputId + '-lbl';

    return (
      <Host
        aria-disabled={this.disabled ? 'true' : null}
        class={{
          'has-value': this.hasValue(),
          'has-focus': this.hasFocus,
        }}
      >
        <input
          class="native-input"
          ref={(input) => (this.nativeInput = input)}
          aria-labelledby={labelId}
          disabled={this.disabled}
          accept={this.accept}
          autoCapitalize={this.autocapitalize}
          autoComplete={this.autocomplete}
          autoCorrect={this.autocorrect}
          autoFocus={this.autofocus}
          enterKeyHint={this.enterkeyhint}
          inputMode={this.inputmode}
          min={this.min}
          max={this.max}
          minLength={this.minlength}
          maxLength={this.maxlength}
          multiple={this.multiple}
          name={this.name}
          pattern={this.pattern}
          placeholder={this.placeholder || ''}
          readOnly={this.readonly}
          required={this.required}
          spellcheck={this.spellcheck ? 'true' : undefined}
          step={this.step}
          size={this.size}
          tabindex={this.tabindex}
          type={this.type}
          value={value}
          onInput={this.onInput}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onKeyDown={this.onKeydown}
        />
        {this.clearInput && !this.readonly && !this.disabled && (
          <button
            type="button"
            class="input-clear-icon"
            tabindex="-1"
            onTouchStart={this.clearTextInput}
            onMouseDown={this.clearTextInput}
          />
        )}
      </Host>
    );
  }
}

let inputIds = 0;
