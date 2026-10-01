import { Component, h } from '@stencil/core';

@Component({ tag: 'ssr-parent', shadow: true, styles: ':host { display: block; }' })
export class Parent {
  render() {
    return (
      <p>
        <slot name="start" />
        <slot />
      </p>
    );
  }
}
