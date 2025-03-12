<script setup lang="ts">
import HelloWorld from '../components/HelloWorld.vue'
// @ts-ignore
import Input from '../components/Input.vue'
import { MyComponent, MyCheckbox, MyInput } from 'component-library-vue'
import { ref } from 'vue'

const input = ref('');
const isClicked = ref(false)
const handleCustomEvent = () => {
  isClicked.value = true
}

const kidsNames = ['John', 'Jane']
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="../assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <MyComponent
    @myCustomEvent="handleCustomEvent"
    :kidsNames="kidsNames"
    first="John"
    middle="Sir"
    favoriteKidName="John"
    :age=20
    last="Doe"
  />
  <p data-testid="mycomponent-click" v-show="isClicked">MyComponent was clicked</p>
  <Input />
  <MyCheckbox @ionChange="console.log">Checkbox!!!</MyCheckbox>
  <hr />
  <my-input v-model="input" />
  <p>Input v-model: {{ input }}</p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
