import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-list-item-scoped',
  scoped: true,
})
export class MyListItemScoped {
  render() {
    return (
      <li>
        <slot></slot>
      </li>
    );
  }
}
