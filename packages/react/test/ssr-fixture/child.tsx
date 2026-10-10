import { Component, h, Host, Prop } from '@stencil/core';

@Component({ tag: 'ssr-child', shadow: { delegatesFocus: true }, styles: ':host { display: inline; }' })
export class Child {
  @Prop({ attribute: 'display-label' }) displayLabel = 'default';
  @Prop() data?: { label: string };

  render() {
    return (
      <Host>
        <span>{this.data?.label ?? this.displayLabel}</span>
        <slot />
      </Host>
    );
  }
}
