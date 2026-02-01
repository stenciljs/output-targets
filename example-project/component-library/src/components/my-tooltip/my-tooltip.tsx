import { Component, Host, h, Prop, Element, Method, State, Event, EventEmitter } from '@stencil/core';

let id = 0;

/**
 * Tooltip component for testing SSR hydration with slot detection
 * 
 * This component demonstrates a pattern where:
 * - Slot presence is checked in componentWillLoad()
 * - State is set based on slot detection
 * - This can cause hydration mismatches because slot detection may differ between server and client
 */
@Component({
  tag: 'my-tooltip',
  styleUrl: 'my-tooltip.css',
  shadow: true
})
export class MyTooltip {
  @Element() el: HTMLElement;

  /**
   * Unique identifier for the component's instance
   */
  private componentId = `tooltip-${++id}`;

  /**
   * Placement of the popover
   */
  @Prop() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';

  /**
   * Whether the popover is open
   */
  @Prop({ mutable: true, reflect: true }) isOpen: boolean = false;

  /**
   * Heading text for the popover
   */
  @Prop() heading: string = '';

  /**
   * Boolean flag to store the presence of trigger slot
   * 
   * This is set in componentWillLoad() based on slot detection,
   * which can cause hydration mismatches
   */
  @State() hasTriggerSlot = false;

  /**
   * Boolean flag to store the presence of content slot
   */
  @State() hasContentSlot = false;

  /**
   * Event emitted when the tooltip opens
   */
  @Event() myTooltipOpen: EventEmitter<void>;

  /**
   * Event emitted when the tooltip closes
   */
  @Event() myTooltipClose: EventEmitter<void>;

  /**
   * Check for slots during componentWillLoad
   * 
   * This is a common pattern that can cause hydration issues because:
   * 1. Slot detection may work differently on server vs client
   * 2. Setting state based on slot presence before first render
   * 3. The server-rendered HTML may not match what the client expects
   */
  componentWillLoad(): void {
    this.handleSlotChange();
  }

  /**
   * Method to show the tooltip
   */
  @Method()
  async show() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.myTooltipOpen.emit();
  }

  /**
   * Method to hide the tooltip
   */
  @Method()
  async hide() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.myTooltipClose.emit();
  }

  /**
   * Toggle the tooltip
   */
  private handleToggle = () => {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.myTooltipOpen.emit();
    } else {
      this.myTooltipClose.emit();
    }
  };

  /**
   * Close the tooltip
   */
  private handleClose = () => {
    this.isOpen = false;
    this.myTooltipClose.emit();
  };

  /**
   * Check for the presence of named slots
   * 
   * This pattern of checking slots and setting state can cause hydration issues
   * because the slot detection may work differently on server vs client
   */
  private handleSlotChange = () => {
    // Check if trigger slot has content
    const triggerSlot = this.el.querySelector('[slot="trigger"]');
    this.hasTriggerSlot = !!triggerSlot;
    
    // Check if content slot has content
    const contentSlot = this.el.querySelector('[slot="content"]');
    this.hasContentSlot = !!contentSlot;
  };

  render() {
    return (
      <Host
        id={this.componentId}
        class={{
          [`placement-${this.placement}`]: true,
          'is-open': this.isOpen
        }}
      >
        <div class="popover-wrapper">
          {/* Trigger - conditionally rendered based on slot detection */}
          {this.hasTriggerSlot ? (
            <div class="trigger-wrapper" onClick={this.handleToggle}>
              <slot name="trigger" onSlotchange={this.handleSlotChange}></slot>
            </div>
          ) : (
            <button class="default-trigger" onClick={this.handleToggle}>
              Open Popover
            </button>
          )}

          {/* Popover content */}
          {this.isOpen && (
            <div class={`popover-content ${this.placement}`}>
              <div class="popover-arrow"></div>
              
              {this.heading && (
                <div class="title-bar">
                  <h3 class="heading">{this.heading}</h3>
                  <button class="close-button" onClick={this.handleClose} aria-label="Close">
                    ×
                  </button>
                </div>
              )}

              {/* Content - conditionally rendered based on slot detection */}
              <div class="popover-body">
                {this.hasContentSlot ? (
                  <slot name="content" onSlotchange={this.handleSlotChange}></slot>
                ) : (
                  <div class="empty-content">
                    <slot></slot>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
