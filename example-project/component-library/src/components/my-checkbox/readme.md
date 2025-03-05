# my-checkbox



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Type                                       | Default        |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------- |
| `alignment`      | `alignment`       | How to control the alignment of the checkbox and label on the cross axis. `"start"`: The label and control will appear on the left of the cross axis in LTR, and on the right side in RTL. `"center"`: The label and control will appear at the center of the cross axis in both LTR and RTL. Setting this property will change the checkbox `display` to `block`.                                                                                                                                                                                     | `"center" \| "start"`                      | `undefined`    |
| `checked`        | `checked`         | If `true`, the checkbox is selected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                  | `false`        |
| `color`          | `color`           | The color to use from your application's color palette. Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`. For more information on colors, see [theming](/docs/theming/basics).                                                                                                                                                                                                                                                                                 | `string`                                   | `undefined`    |
| `disabled`       | `disabled`        | If `true`, the user cannot interact with the checkbox.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `boolean`                                  | `false`        |
| `indeterminate`  | `indeterminate`   | If `true`, the checkbox will visually appear as indeterminate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `boolean`                                  | `false`        |
| `justify`        | `justify`         | How to pack the label and checkbox within a line. `"start"`: The label and checkbox will appear on the left in LTR and on the right in RTL. `"end"`: The label and checkbox will appear on the right in LTR and on the left in RTL. `"space-between"`: The label and checkbox will appear on opposite ends of the line with space between the two elements. Setting this property will change the checkbox `display` to `block`.                                                                                                                       | `"end" \| "space-between" \| "start"`      | `undefined`    |
| `labelPlacement` | `label-placement` | Where to place the label relative to the checkbox. `"start"`: The label will appear to the left of the checkbox in LTR and to the right in RTL. `"end"`: The label will appear to the right of the checkbox in LTR and to the left in RTL. `"fixed"`: The label has the same behavior as `"start"` except it also has a fixed width. Long text will be truncated with ellipses ("..."). `"stacked"`: The label will appear above the checkbox regardless of the direction. The alignment of the label can be controlled with the `alignment` property. | `"end" \| "fixed" \| "stacked" \| "start"` | `'start'`      |
| `mode`           | `mode`            | The mode determines which platform styles to use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `"ios" \| "md"`                            | `undefined`    |
| `name`           | `name`            | The name of the control, which is submitted with the form data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `string`                                   | `this.inputId` |
| `value`          | `value`           | The value of the checkbox does not mean if it's checked or not, use the `checked` property for that.  The value of a checkbox is analogous to the value of an `<input type="checkbox">`, it's only used when the checkbox participates in a native `<form>`.                                                                                                                                                                                                                                                                                           | `any`                                      | `'on'`         |


## Events

| Event       | Description                                                                                                                                                                 | Type                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ionBlur`   | Emitted when the checkbox loses focus.                                                                                                                                      | `CustomEvent<void>`                           |
| `ionChange` | Emitted when the checked property has changed as a result of a user action such as a click.  This event will not emit when programmatically setting the `checked` property. | `CustomEvent<CheckboxChangeEventDetail<any>>` |
| `ionFocus`  | Emitted when the checkbox has focus.                                                                                                                                        | `CustomEvent<void>`                           |


## Slots

| Slot | Description                                                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
|      | The label text to associate with the checkbox. Use the "labelPlacement" property to control where the label is placed relative to the checkbox. |


## Shadow Parts

| Part          | Description                                       |
| ------------- | ------------------------------------------------- |
| `"container"` | The container for the checkbox mark.              |
| `"label"`     | The label text describing the checkbox.           |
| `"mark"`      | The checkmark used to indicate the checked state. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
