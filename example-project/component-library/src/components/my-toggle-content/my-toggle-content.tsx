import { Component, Event, EventEmitter, Fragment, h, Prop } from '@stencil/core';

@Component({
  tag: 'my-toggle-content',
  shadow: true,
})
export class MyToggleContent {
  @Prop() visible: boolean;
  @Event({ eventName: 'my-kebab-event' }) kebabEvent!: EventEmitter<string>;

  render() {
    return (
      this.visible && (
        <Fragment>
          <div>
            <button onClick={() => this.kebabEvent.emit('clicked')}>Emit event</button>
            <slot></slot>
          </div>
        </Fragment>
      )
    );
  }
}
