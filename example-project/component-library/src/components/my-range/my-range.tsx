import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';

import { Color, StyleEventDetail } from '../element-interface';
import { clamp, debounceEvent, renderHiddenInput } from '../helpers';

export type KnobName = 'A' | 'B' | undefined;
export type RangeValue = number | { lower: number; upper: number };

export interface RangeChangeEventDetail {
  value: RangeValue;
}

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot start - Content is placed to the left of the range slider in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the range slider in LTR, and to the left in RTL.
 *
 * @part tick - An inactive tick mark.
 * @part tick-active - An active tick mark.
 * @part pin - The counter that appears above a knob.
 * @part knob - The handle that is used to drag the range.
 * @part bar - The inactive part of the bar.
 * @part bar-active - The active part of the bar.
 */
@Component({
  tag: 'my-range',
  styleUrl: 'my-range.css',
  shadow: true,
})
export class MyRange implements ComponentInterface {
  private noUpdate = false;
  private hasFocus = false;

  @Element() el!: HTMLMyRangeElement;

  @State() private ratioA = 0;
  @State() private ratioB = 0;
  @State() private pressedKnob: KnobName;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop() color?: Color;

  /**
   * How long, in milliseconds, to wait to trigger the
   * `myChange` event after each change in the range value.
   */
  @Prop() debounce = 0;

  @Watch('debounce')
  protected debounceChanged() {
    this.myChange = debounceEvent(this.myChange, this.debounce);
  }

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name = '';

  /**
   * Show two knobs.
   */
  @Prop() dualKnobs = false;

  /**
   * Minimum integer value of the range.
   */
  @Prop() min = 0;
  @Watch('min')
  protected minChanged() {
    if (!this.noUpdate) {
      this.updateRatio();
    }
  }

  /**
   * Maximum integer value of the range.
   */
  @Prop() max = 100;
  @Watch('max')
  protected maxChanged() {
    if (!this.noUpdate) {
      this.updateRatio();
    }
  }

  /**
   * If `true`, a pin with integer value is shown when the knob
   * is pressed.
   */
  @Prop() pin = false;

  /**
   * If `true`, the knob snaps to tick marks evenly spaced based
   * on the step property value.
   */
  @Prop() snaps = false;

  /**
   * Specifies the value granularity.
   */
  @Prop() step = 1;

  /**
   * If `true`, tick marks are displayed based on the step value.
   * Only applies when `snaps` is `true`.
   */
  @Prop() ticks = true;

  /**
   * If `true`, the user cannot interact with the range.
   */
  @Prop() disabled = false;
  @Watch('disabled')
  protected disabledChanged() {
    this.emitStyle();
  }

  /**
   * the value of the range.
   */
  @Prop({ mutable: true }) value: RangeValue = 0;
  @Watch('value')
  protected valueChanged() {
    if (!this.noUpdate) {
      this.updateRatio();
    }
  }

  private clampBounds = (value: any): number => {
    return clamp(this.min, value, this.max);
  };

  private ensureValueInBounds = (value: any) => {
    if (this.dualKnobs) {
      return {
        lower: this.clampBounds(value.lower),
        upper: this.clampBounds(value.upper),
      };
    } else {
      return this.clampBounds(value);
    }
  };

  /**
   * Emitted when the value property has changed.
   */
  @Event() myChange!: EventEmitter<RangeChangeEventDetail>;

  /**
   * Emitted when the styles change.
   * @internal
   */
  @Event() myStyle!: EventEmitter<StyleEventDetail>;

  /**
   * Emitted when the range has focus.
   */
  @Event() myFocus!: EventEmitter<void>;

  /**
   * Emitted when the range loses focus.
   */
  @Event() myBlur!: EventEmitter<void>;

  connectedCallback() {
    this.updateRatio();
    this.debounceChanged();
    this.disabledChanged();
  }

  private handleKeyboard = (knob: KnobName, isIncrease: boolean) => {
    let step = this.step;
    step = step > 0 ? step : 1;
    step = step / (this.max - this.min);
    if (!isIncrease) {
      step *= -1;
    }
    if (knob === 'A') {
      this.ratioA = clamp(0, this.ratioA + step, 1);
    } else {
      this.ratioB = clamp(0, this.ratioB + step, 1);
    }
    this.updateValue();
  };

  private rangeSlider?: HTMLElement;
  private rect!: DOMRect;

  private onStart = (ev: PointerEvent) => {
    if (this.disabled) {
      return;
    }

    const rangeSlider = this.rangeSlider;
    if (!rangeSlider) {
      return;
    }

    // Capture the pointer so move/up events keep firing even if the
    // pointer leaves the slider while dragging.
    rangeSlider.setPointerCapture(ev.pointerId);
    this.rect = rangeSlider.getBoundingClientRect();

    // Decide which knob to move based on which one is closest to the press.
    const ratio = this.ratioFromPointer(ev.clientX);
    this.pressedKnob = !this.dualKnobs || Math.abs(this.ratioA - ratio) <= Math.abs(this.ratioB - ratio) ? 'A' : 'B';

    this.update(ratio);
  };

  private onMove = (ev: PointerEvent) => {
    if (this.pressedKnob === undefined) {
      return;
    }
    this.update(this.ratioFromPointer(ev.clientX));
  };

  private onEnd = (ev: PointerEvent) => {
    if (this.pressedKnob === undefined) {
      return;
    }
    this.update(this.ratioFromPointer(ev.clientX));
    this.rangeSlider?.releasePointerCapture(ev.pointerId);
    this.pressedKnob = undefined;
  };

  private ratioFromPointer(clientX: number): number {
    const rect = this.rect;
    let ratio = clamp(0, (clientX - rect.left) / rect.width, 1);
    if (document.dir === 'rtl') {
      ratio = 1 - ratio;
    }
    // Snap the ratio to the nearest step when snaps are enabled.
    if (this.snaps) {
      ratio = valueToRatio(ratioToValue(ratio, this.min, this.max, this.step), this.min, this.max);
    }
    return ratio;
  }

  private update(ratio: number) {
    if (this.pressedKnob === 'B') {
      this.ratioB = ratio;
    } else {
      this.ratioA = ratio;
    }
    this.updateValue();
  }

  private getValue(): RangeValue {
    const value = this.value || 0;
    if (this.dualKnobs) {
      if (typeof value === 'object') {
        return value;
      }
      return {
        lower: 0,
        upper: value,
      };
    } else {
      if (typeof value === 'object') {
        return value.upper;
      }
      return value;
    }
  }

  private emitStyle() {
    this.myStyle.emit({
      interactive: true,
      'interactive-disabled': this.disabled,
    });
  }

  private get valA(): number {
    return ratioToValue(this.ratioA, this.min, this.max, this.step);
  }

  private get valB(): number {
    return ratioToValue(this.ratioB, this.min, this.max, this.step);
  }

  private get ratioLower(): number {
    if (this.dualKnobs) {
      return Math.min(this.ratioA, this.ratioB);
    }
    return 0;
  }

  private get ratioUpper(): number {
    if (this.dualKnobs) {
      return Math.max(this.ratioA, this.ratioB);
    }
    return this.ratioA;
  }

  private updateRatio() {
    let value = this.getValue() as any;
    const { min, max } = this;
    if (this.dualKnobs) {
      this.ratioA = valueToRatio(value.lower, min, max);
      this.ratioB = valueToRatio(value.upper, min, max);
    } else {
      this.ratioA = valueToRatio(value, min, max);
    }

    value = this.ensureValueInBounds(value);

    this.value = value;
    this.myChange.emit({ value });
  }

  private updateValue() {
    this.noUpdate = true;

    const { valA, valB } = this;
    this.value = !this.dualKnobs
      ? valA
      : {
          lower: Math.min(valA, valB),
          upper: Math.max(valA, valB),
        };

    this.noUpdate = false;

    this.myChange.emit({ value: this.value });
  }

  private onBlur = () => {
    if (this.hasFocus) {
      this.hasFocus = false;
      this.myBlur.emit();
      this.emitStyle();
    }
  };

  private onFocus = () => {
    if (!this.hasFocus) {
      this.hasFocus = true;
      this.myFocus.emit();
      this.emitStyle();
    }
  };

  render() {
    const { min, max, step, el, handleKeyboard, pressedKnob, disabled, pin, ratioLower, ratioUpper } = this;

    const barStart = `${ratioLower * 100}%`;
    const barEnd = `${100 - ratioUpper * 100}%`;

    const doc = document;
    const isRTL = doc.dir === 'rtl';
    const start = isRTL ? 'right' : 'left';
    const end = isRTL ? 'left' : 'right';

    const tickStyle = (tick: any) => {
      return {
        [start]: tick[start],
      };
    };

    const barStyle = {
      [start]: barStart,
      [end]: barEnd,
    };

    const ticks = [];
    if (this.snaps && this.ticks) {
      for (let value = min; value <= max; value += step) {
        const ratio = valueToRatio(value, min, max);

        const tick: any = {
          ratio,
          active: ratio >= ratioLower && ratio <= ratioUpper,
        };

        tick[start] = `${ratio * 100}%`;

        ticks.push(tick);
      }
    }

    renderHiddenInput(true, el, this.name, JSON.stringify(this.getValue()), disabled);

    return (
      <Host
        onFocusin={this.onFocus}
        onFocusout={this.onBlur}
        class={{
          'range-disabled': disabled,
          'range-pressed': pressedKnob !== undefined,
          'range-has-pin': pin,
        }}
      >
        <slot name="start"></slot>
        <div
          class="range-slider"
          ref={(rangeEl) => (this.rangeSlider = rangeEl)}
          onPointerDown={this.onStart}
          onPointerMove={this.onMove}
          onPointerUp={this.onEnd}
          onPointerCancel={this.onEnd}
        >
          {ticks.map((tick) => (
            <div
              style={tickStyle(tick)}
              role="presentation"
              class={{
                'range-tick': true,
                'range-tick-active': tick.active,
              }}
              part={tick.active ? 'tick-active' : 'tick'}
            />
          ))}

          <div class="range-bar" role="presentation" part="bar" />
          <div class="range-bar range-bar-active" role="presentation" style={barStyle} part="bar-active" />

          {renderKnob(isRTL, {
            knob: 'A',
            pressed: pressedKnob === 'A',
            value: this.valA,
            ratio: this.ratioA,
            pin,
            disabled,
            handleKeyboard,
            min,
            max,
          })}

          {this.dualKnobs &&
            renderKnob(isRTL, {
              knob: 'B',
              pressed: pressedKnob === 'B',
              value: this.valB,
              ratio: this.ratioB,
              pin,
              disabled,
              handleKeyboard,
              min,
              max,
            })}
        </div>
        <slot name="end"></slot>
      </Host>
    );
  }
}

interface RangeKnob {
  knob: KnobName;
  value: number;
  ratio: number;
  min: number;
  max: number;
  disabled: boolean;
  pressed: boolean;
  pin: boolean;

  handleKeyboard: (name: KnobName, isIncrease: boolean) => void;
}

const renderKnob = (
  isRTL: boolean,
  { knob, value, ratio, min, max, disabled, pressed, pin, handleKeyboard }: RangeKnob
) => {
  const start = isRTL ? 'right' : 'left';

  const knobStyle = () => {
    const style: any = {};

    style[start] = `${ratio * 100}%`;

    return style;
  };

  return (
    <div
      onKeyDown={(ev: KeyboardEvent) => {
        const key = ev.key;
        if (key === 'ArrowLeft' || key === 'ArrowDown') {
          handleKeyboard(knob, false);
          ev.preventDefault();
          ev.stopPropagation();
        } else if (key === 'ArrowRight' || key === 'ArrowUp') {
          handleKeyboard(knob, true);
          ev.preventDefault();
          ev.stopPropagation();
        }
      }}
      class={{
        'range-knob-handle': true,
        'range-knob-a': knob === 'A',
        'range-knob-b': knob === 'B',
        'range-knob-pressed': pressed,
        'range-knob-min': value === min,
        'range-knob-max': value === max,
      }}
      style={knobStyle()}
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-disabled={disabled ? 'true' : null}
      aria-valuenow={value}
    >
      {pin && (
        <div class="range-pin" role="presentation" part="pin">
          {Math.round(value)}
        </div>
      )}
      <div class="range-knob" role="presentation" part="knob" />
    </div>
  );
};

const ratioToValue = (ratio: number, min: number, max: number, step: number): number => {
  let value = (max - min) * ratio;
  if (step > 0) {
    value = Math.round(value / step) * step + min;
  }
  return clamp(min, value, max);
};

const valueToRatio = (value: number, min: number, max: number): number => {
  return clamp(0, (value - min) / (max - min), 1);
};
