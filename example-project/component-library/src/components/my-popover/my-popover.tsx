import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Method, Prop, h } from '@stencil/core';

import { ComponentProps, ComponentRef, OverlayEventDetail, OverlayInterface } from '../../interfaces';

import { eventMethod } from '../helpers';

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
@Component({
  tag: 'my-popover',
  scoped: true,
})
export class Popover implements ComponentInterface, OverlayInterface {
  presented = false;

  overlayIndex = 0;

  @Element() el: HTMLMyPopoverElement;

  /**
   * The component to display inside of the popover.
   */
  @Prop() component!: ComponentRef;

  /**
   * The data to pass to the popover component.
   */
  @Prop() componentProps?: ComponentProps;

  /**
   * If `true`, the keyboard will be automatically dismissed when the overlay is presented.
   */
  @Prop() keyboardClose = true;

  /**
   * Additional classes to apply for custom CSS. If multiple classes are
   * provided they should be separated by spaces.
   */
  @Prop() cssClass?: string | string[];

  /**
   * If `true`, the popover will be dismissed when the backdrop is clicked.
   */
  @Prop() backdropDismiss = true;

  /**
   * The event to pass to the popover animation.
   */
  @Prop() event: any;

  /**
   * If `true`, a backdrop will be displayed behind the popover.
   */
  @Prop() showBackdrop = true;

  /**
   * If `true`, the popover will be translucent.
   * Only applies when the mode is `"ios"` and the device supports
   * [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility).
   */
  @Prop() translucent = false;

  /**
   * If `true`, the popover will animate.
   */
  @Prop() animated = true;

  /**
   * Emitted after the popover has presented.
   */
  @Event({ eventName: 'myPopoverDidPresent' }) didPresent!: EventEmitter<void>;

  /**
   * Emitted before the popover has presented.
   */
  @Event({ eventName: 'myPopoverWillPresent' }) willPresent!: EventEmitter<void>;

  /**
   * Emitted before the popover has dismissed.
   */
  @Event({ eventName: 'myPopoverWillDismiss' }) willDismiss!: EventEmitter<OverlayEventDetail>;

  /**
   * Emitted after the popover has dismissed.
   */
  @Event({ eventName: 'myPopoverDidDismiss' }) didDismiss!: EventEmitter<OverlayEventDetail>;

  /**
   * Present the popover overlay after it has been created.
   */
  @Method()
  async present(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Dismiss the popover overlay after it has been presented.
   *
   * @param data Any data to emit in the dismiss events.
   * @param role The role of the element that is dismissing the popover. For example, 'cancel' or 'backdrop'.
   */
  @Method()
  async dismiss(_data?: any, _role?: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Returns a promise that resolves when the popover did dismiss.
   */
  @Method()
  onDidDismiss(): Promise<OverlayEventDetail> {
    return eventMethod(this.el, 'myPopoverDidDismiss');
  }

  /**
   * Returns a promise that resolves when the popover will dismiss.
   */
  @Method()
  onWillDismiss(): Promise<OverlayEventDetail> {
    return eventMethod(this.el, 'myPopoverWillDismiss');
  }

  private onDismiss = (ev: UIEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    this.dismiss();
  };

  private onBackdropTap = () => {
    this.dismiss(undefined, 'backdrop');
  };

  render() {
    return (
      <Host
        aria-modal="true"
        no-router
        tabindex="-1"
        style={{
          zIndex: `${20000 + this.overlayIndex}`,
        }}
        class={{
          'popover-translucent': this.translucent,
        }}
        onIonDismiss={this.onDismiss}
        onIonBackdropTap={this.onBackdropTap}
      >
        <my-backdrop tappable={this.backdropDismiss} visible={this.showBackdrop} />
        <div class="popover-wrapper">
          <div class="popover-arrow"></div>
          <div class="popover-content"></div>
        </div>
      </Host>
    );
  }
}
