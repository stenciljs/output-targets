# my-radio-group



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description                                                                                                                                                                                                                                              | Type                 | Default        |
| --------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------- |
| `allowEmptySelection` | `allow-empty-selection` | If `true`, the radios can be deselected.                                                                                                                                                                                                                 | `boolean`            | `false`        |
| `compareWith`         | `compare-with`          | This property allows developers to specify a custom function or property name for comparing objects when determining the selected option in the ion-radio-group. When not specified, the default behavior will use strict equality (===) for comparison. | `Function \| string` | `undefined`    |
| `name`                | `name`                  | The name of the control, which is submitted with the form data.                                                                                                                                                                                          | `string`             | `this.inputId` |
| `value`               | `value`                 | the value of the radio group.                                                                                                                                                                                                                            | `any`                | `undefined`    |


## Events

| Event      | Description                                                                                                       | Type                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `myChange` | Emitted when the value has changed.  This event will not emit when programmatically setting the `value` property. | `CustomEvent<RadioGroupChangeEventDetail<any>>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
