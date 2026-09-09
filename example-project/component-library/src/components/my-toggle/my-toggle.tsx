import { Component, Fragment, h, State } from '@stencil/core';

@Component({
  tag: 'my-toggle',
  shadow: true,
})
export class MyToggle {
  @State() showContent = false;

  render() {
    return (
      <Fragment>
        <button onClick={() => (this.showContent = !this.showContent)}>Open Modal</button>
        <my-toggle-content visible={this.showContent}>
          <slot></slot>
        </my-toggle-content>
      </Fragment>
    );
  }
}
