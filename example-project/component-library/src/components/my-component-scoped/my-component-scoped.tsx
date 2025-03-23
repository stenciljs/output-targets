import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import type { IMyComponent } from '../helpers';

@Component({
  tag: 'my-component-scoped',
  styleUrl: 'my-component-scoped.css',
  scoped: true,
})
export class MyComponentScoped {
  /**
   * The first name
   */
  @Prop() first: string;

  /**
   * The middle name (using kebab case name)
   */
  @Prop() middleName: string;

  /**
   * The last name
   */
  @Prop() last: string;

  /**
   * Testing an event without value
   */
  @Event() myCustomEvent: EventEmitter<IMyComponent.someVar>;

  private getText(): string {
    return `${this.first} ${this.middleName} ${this.last}`;
  }

  render() {
    return (
      <div>
        Hello, World! I'm {this.getText()}
      </div>
    );
  }
}
