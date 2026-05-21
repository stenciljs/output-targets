import { Component, EventEmitter, Prop, Event, h, Listen } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
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

  @Prop() kidsNames: string[];

  @Event() myCustomEvent: EventEmitter<void>;

  @Listen('click')
  onClick() {
    this.myCustomEvent.emit();
  }

  private getText(): string {
    return `${this.first} ${this.middleName} ${this.last}`;
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
