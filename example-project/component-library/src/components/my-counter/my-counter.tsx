import { Component, Prop, h, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'my-counter',
  styleUrl: './my-counter.css',
  shadow: true,
})
export class MyCounter {
  @State() countValue = 0;

  /**
   * The start value
   */
  @Prop() startValue: number;

  @Watch('startValue', { immediate: true })
  watchStartValue(newValue: number) {
    this.startValue = this.countValue = newValue;
  }

  /**
   * Emitted when the count changes
   */
  @Event() count: EventEmitter<number>;

  connectedCallback() {
    this.countValue = this.startValue ?? 0;
  }

  private countMe(newValue: number) {
    this.countValue = newValue;
    this.count.emit(newValue);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.countMe(this.countValue - 1)}>-</button>
        <span>{this.countValue}</span>
        <button onClick={() => this.countMe(this.countValue + 1)}>+</button>
      </div>
    );
  }
}
