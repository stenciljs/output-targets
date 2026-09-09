import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-list-item',
  shadow: true,
})
export class MyListItem {
  render() {
    return (
      <li>
        <slot></slot>
      </li>
    );
  }
}
