import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-list',
  shadow: true,
})
export class MyList {
  render() {
    return (
      <ul>
        <slot></slot>
      </ul>
    );
  }
}
