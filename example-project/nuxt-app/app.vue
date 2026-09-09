<script setup>
import { MyCheckbox, MyComponent, MyRange, MyRadioGroup } from 'component-library-vue'

function handleCheckboxChange(event) {
  console.log('Checkbox changed:', event.detail.checked)
}

</script>

<template>
  <div>
    <Input />
    <hr />
    <MyComponent first="Stencil" last="'Don't call me a framework' JS" />
    <hr />
    <MyRange name="myRange">Hello World</MyRange>
    <hr />
    <MyRadioGroup name="myRadioGroup" value="two">
      <input type="radio" name="myRadioGroup" value="one" />
      <input type="radio" name="myRadioGroup" value="two" />
      <input type="radio" name="myRadioGroup" value="three" />
    </MyRadioGroup>

    <MyCheckbox @ionChange="handleCheckboxChange">Checkbox!!!</MyCheckbox>
  </div>
</template>
