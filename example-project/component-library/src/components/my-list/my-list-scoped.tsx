import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-list-scoped',
  scoped: true,
})
export class MyListScoped {
  render() {
    return (
      <ul>
        <slot></slot>
      </ul>
    );
  }
}
