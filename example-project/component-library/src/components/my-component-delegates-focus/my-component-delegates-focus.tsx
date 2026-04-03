import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-component-delegates-focus',
  styleUrl: 'my-component-delegates-focus.css',
  shadow: {
    delegatesFocus: true,
  },
})
export class MyComponentDelegatesFocus {
  render() {
    return <div>Focusing the host should focus this button <button>Button</button></div>;
  }
}
