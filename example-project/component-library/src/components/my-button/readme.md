# ion-button



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                                                                                                                                                                                                                                                                               | Type                                           | Default     |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| `buttonType` | `button-type` | The type of button.                                                                                                                                                                                                                                                                       | `string`                                       | `'button'`  |
| `color`      | `color`       | The color to use from your application's color palette. Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`. For more information on colors, see [theming](/docs/theming/basics).                    | `string`                                       | `undefined` |
| `disabled`   | `disabled`    | If `true`, the user cannot interact with the button.                                                                                                                                                                                                                                      | `boolean`                                      | `false`     |
| `download`   | `download`    | This attribute instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file. If the attribute has a value, it is used as the pre-filled file name in the Save prompt (the user can still change the file name if they want). | `string`                                       | `undefined` |
| `expand`     | `expand`      | Set to `"block"` for a full-width button or to `"full"` for a full-width button without left and right borders.                                                                                                                                                                           | `"block" \| "full"`                            | `undefined` |
| `fill`       | `fill`        | Set to `"clear"` for a transparent button, to `"outline"` for a transparent button with a border, or to `"solid"`. The default style is `"solid"` except inside of a toolbar, where the default is `"clear"`.                                                                             | `"clear" \| "default" \| "outline" \| "solid"` | `undefined` |
| `href`       | `href`        | Contains a URL or a URL fragment that the hyperlink points to. If this property is set, an anchor tag will be rendered.                                                                                                                                                                   | `string`                                       | `undefined` |
| `mode`       | `mode`        | The mode determines which platform styles to use.                                                                                                                                                                                                                                         | `"ios" \| "md"`                                | `undefined` |
| `rel`        | `rel`         | Specifies the relationship of the target object to the link object. The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).                                                                                                    | `string`                                       | `undefined` |
| `shape`      | `shape`       | The button shape.                                                                                                                                                                                                                                                                         | `"round"`                                      | `undefined` |
| `size`       | `size`        | The button size.                                                                                                                                                                                                                                                                          | `"default" \| "large" \| "small"`              | `undefined` |
| `strong`     | `strong`      | If `true`, activates a button with a heavier font weight.                                                                                                                                                                                                                                 | `boolean`                                      | `false`     |
| `target`     | `target`      | Specifies where to display the linked URL. Only applies when an `href` is provided. Special keywords: `"_blank"`, `"_self"`, `"_parent"`, `"_top"`.                                                                                                                                       | `string`                                       | `undefined` |
| `type`       | `type`        | The type of the button.                                                                                                                                                                                                                                                                   | `"button" \| "reset" \| "submit"`              | `'button'`  |


## Events

| Event     | Description                          | Type                |
| --------- | ------------------------------------ | ------------------- |
| `myBlur`  | Emitted when the button loses focus. | `CustomEvent<void>` |
| `myFocus` | Emitted when the button has focus.   | `CustomEvent<void>` |


## Slots

| Slot          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
|               | Content is placed between the named slots if provided without a slot.             |
| `"end"`       | Content is placed to the right of the button text in LTR, and to the left in RTL. |
| `"icon-only"` | Should be used on an icon in a button that has no text.                           |
| `"start"`     | Content is placed to the left of the button text in LTR, and to the right in RTL. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
