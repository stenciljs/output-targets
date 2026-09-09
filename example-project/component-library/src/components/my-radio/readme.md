# my-radio



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type                                       | Default        |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------- |
| `alignment`      | `alignment`       | How to control the alignment of the radio and label on the cross axis. `"start"`: The label and control will appear on the left of the cross axis in LTR, and on the right side in RTL. `"center"`: The label and control will appear at the center of the cross axis in both LTR and RTL. Setting this property will change the radio `display` to `block`.                                                                                                                                                                               | `"center" \| "start"`                      | `undefined`    |
| `color`          | `color`           | The color to use from your application's color palette. Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`. For more information on colors, see [theming](/docs/theming/basics).                                                                                                                                                                                                                                                                     | `string`                                   | `undefined`    |
| `disabled`       | `disabled`        | If `true`, the user cannot interact with the radio.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `boolean`                                  | `false`        |
| `justify`        | `justify`         | How to pack the label and radio within a line. `"start"`: The label and radio will appear on the left in LTR and on the right in RTL. `"end"`: The label and radio will appear on the right in LTR and on the left in RTL. `"space-between"`: The label and radio will appear on opposite ends of the line with space between the two elements. Setting this property will change the radio `display` to `block`.                                                                                                                          | `"end" \| "space-between" \| "start"`      | `undefined`    |
| `labelPlacement` | `label-placement` | Where to place the label relative to the radio. `"start"`: The label will appear to the left of the radio in LTR and to the right in RTL. `"end"`: The label will appear to the right of the radio in LTR and to the left in RTL. `"fixed"`: The label has the same behavior as `"start"` except it also has a fixed width. Long text will be truncated with ellipses ("..."). `"stacked"`: The label will appear above the radio regardless of the direction. The alignment of the label can be controlled with the `alignment` property. | `"end" \| "fixed" \| "stacked" \| "start"` | `'start'`      |
| `mode`           | `mode`            | The mode determines which platform styles to use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `"ios" \| "md"`                            | `undefined`    |
| `name`           | `name`            | The name of the control, which is submitted with the form data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `string`                                   | `this.inputId` |
| `value`          | `value`           | the value of the radio.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `any`                                      | `undefined`    |


## Events

| Event      | Description                                | Type                |
| ---------- | ------------------------------------------ | ------------------- |
| `ionBlur`  | Emitted when the radio button loses focus. | `CustomEvent<void>` |
| `ionFocus` | Emitted when the radio button has focus.   | `CustomEvent<void>` |


## Slots

| Slot | Description                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
|      | The label text to associate with the radio. Use the "labelPlacement" property to control where the label is placed relative to the radio. |


## Shadow Parts

| Part          | Description                                              |
| ------------- | -------------------------------------------------------- |
| `"container"` | The container for the radio mark.                        |
| `"label"`     | The label text describing the radio.                     |
| `"mark"`      | The checkmark or dot used to indicate the checked state. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
