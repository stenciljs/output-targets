# ion-popover



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute          | Description                                                                                                                                                                                                            | Type                                | Default     |
| ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------- |
| `animated`               | `animated`         | If `true`, the popover will animate.                                                                                                                                                                                   | `boolean`                           | `true`      |
| `backdropDismiss`        | `backdrop-dismiss` | If `true`, the popover will be dismissed when the backdrop is clicked.                                                                                                                                                 | `boolean`                           | `true`      |
| `component` _(required)_ | `component`        | The component to display inside of the popover.                                                                                                                                                                        | `Function \| HTMLElement \| string` | `undefined` |
| `componentProps`         | --                 | The data to pass to the popover component.                                                                                                                                                                             | `T`                                 | `undefined` |
| `cssClass`               | `css-class`        | Additional classes to apply for custom CSS. If multiple classes are provided they should be separated by spaces.                                                                                                       | `string \| string[]`                | `undefined` |
| `event`                  | `event`            | The event to pass to the popover animation.                                                                                                                                                                            | `any`                               | `undefined` |
| `keyboardClose`          | `keyboard-close`   | If `true`, the keyboard will be automatically dismissed when the overlay is presented.                                                                                                                                 | `boolean`                           | `true`      |
| `mode`                   | `mode`             | The mode determines which platform styles to use.                                                                                                                                                                      | `"ios" \| "md"`                     | `undefined` |
| `showBackdrop`           | `show-backdrop`    | If `true`, a backdrop will be displayed behind the popover.                                                                                                                                                            | `boolean`                           | `true`      |
| `translucent`            | `translucent`      | If `true`, the popover will be translucent. Only applies when the mode is `"ios"` and the device supports [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility). | `boolean`                           | `false`     |


## Events

| Event                  | Description                               | Type                                   |
| ---------------------- | ----------------------------------------- | -------------------------------------- |
| `myPopoverDidDismiss`  | Emitted after the popover has dismissed.  | `CustomEvent<OverlayEventDetail<any>>` |
| `myPopoverDidPresent`  | Emitted after the popover has presented.  | `CustomEvent<void>`                    |
| `myPopoverWillDismiss` | Emitted before the popover has dismissed. | `CustomEvent<OverlayEventDetail<any>>` |
| `myPopoverWillPresent` | Emitted before the popover has presented. | `CustomEvent<void>`                    |


## Methods

### `dismiss(_data?: any, _role?: string) => Promise<boolean>`

Dismiss the popover overlay after it has been presented.

#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `_data` | `any`    |             |
| `_role` | `string` |             |

#### Returns

Type: `Promise<boolean>`



### `onDidDismiss() => Promise<OverlayEventDetail>`

Returns a promise that resolves when the popover did dismiss.

#### Returns

Type: `Promise<OverlayEventDetail<any>>`



### `onWillDismiss() => Promise<OverlayEventDetail>`

Returns a promise that resolves when the popover will dismiss.

#### Returns

Type: `Promise<OverlayEventDetail<any>>`



### `present() => Promise<void>`

Present the popover overlay after it has been created.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
