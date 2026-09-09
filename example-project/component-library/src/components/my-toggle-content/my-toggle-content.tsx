import { Component, Fragment, h, Prop } from '@stencil/core';

@Component({
  tag: 'my-toggle-content',
  shadow: true,
})
export class MyToggleContent {
  @Prop() visible: boolean;

  render() {
    return (
      this.visible && (
        <Fragment>
          <div>
            <slot></slot>
          </div>
        </Fragment>
      )
    );
  }
}
