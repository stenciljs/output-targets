# my-tooltip



<!-- Auto Generated Below -->


## Overview

Tooltip component for testing SSR hydration with slot detection

This component demonstrates a pattern where:
- Slot presence is checked in componentWillLoad()
- State is set based on slot detection
- This can cause hydration mismatches because slot detection may differ between server and client

## Properties

| Property    | Attribute   | Description                  | Type                                     | Default |
| ----------- | ----------- | ---------------------------- | ---------------------------------------- | ------- |
| `heading`   | `heading`   | Heading text for the popover | `string`                                 | `''`    |
| `isOpen`    | `is-open`   | Whether the popover is open  | `boolean`                                | `false` |
| `placement` | `placement` | Placement of the popover     | `"bottom" \| "left" \| "right" \| "top"` | `'top'` |


## Events

| Event            | Description                           | Type                |
| ---------------- | ------------------------------------- | ------------------- |
| `myTooltipClose` | Event emitted when the tooltip closes | `CustomEvent<void>` |
| `myTooltipOpen`  | Event emitted when the tooltip opens  | `CustomEvent<void>` |


## Methods

### `hide() => Promise<void>`

Method to hide the tooltip

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Method to show the tooltip

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
