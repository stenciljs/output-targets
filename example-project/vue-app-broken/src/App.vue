<script setup lang="ts">
import { MyComponent, MyButton } from 'component-library-vue'
</script>

<template>
  <MyComponent
    kidsNames="John"
  />
  <my-button fill="ups">Button</my-button>
  <my-button router-link="/">Button</my-button>
</template>
