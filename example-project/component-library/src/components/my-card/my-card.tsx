import { Component, h } from '@stencil/core';

/**
 * A minimal component with named slots, used to test slot assignment.
 *
 * @slot start - Content placed before the default content.
 * @slot - Default content.
 * @slot end - Content placed after the default content.
 */
@Component({
  tag: 'my-card',
  shadow: true,
})
export class MyCard {
  render() {
    return (
      <div>
        <slot name="start"></slot>
        <slot></slot>
        <slot name="end"></slot>
      </div>
    );
  }
}
