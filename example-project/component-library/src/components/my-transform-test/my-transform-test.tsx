import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'my-transform-test',
  styleUrl: 'my-transform-test.css',
  shadow: true,
})
export class MyTransformTest {
  @Prop() message: string = 'Transform Test Component';

  render() {
    return (
      <Host>
        <div class="transform-test">
          <h3>{this.message}</h3>
          <p>This component is used to test tag transformation functionality.</p>
        </div>
      </Host>
    );
  }
}
