<script setup lang="ts">
import HelloWorld from '../components/HelloWorld.vue'
// @ts-ignore
import Input from '../components/Input.vue'
// @ts-ignore
import Checkbox from '../components/Checkbox.vue';
import HydratedClassTest from '../components/HydratedClassTest.vue';
import { MyComponent, MyCheckbox, MyInput, MyRadio, MyRadioGroup, MyTransformTest } from 'component-library-vue'
import { ref } from 'vue'


const input = ref('');
const isClicked = ref(false)
const handleCustomEvent = () => {
  isClicked.value = true
}

const kidsNames = ['John', 'Jane']
const radioGroupValue = ref('option1')
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
    middleName="Sir"
    last="Doe"
  />
  <p data-testid="mycomponent-click" v-show="isClicked">MyComponent was clicked</p>
  <Input />
  <Checkbox />
  <MyCheckbox @ionChange="console.log">Checkbox!!!</MyCheckbox>
  <hr />
  <my-input v-model="input" />
  <p>Input v-model: {{ input }}</p>
  <hr />
  <my-radio-group v-model="radioGroupValue" name="radioGroup">
    <my-radio value="option1">Option 1</my-radio>
    <my-radio value="option2">Option 2</my-radio>
    <my-radio value="option3">Option 3</my-radio>
  </my-radio-group>
  <p data-testid="radio-group-value">Radio Group Value: {{ radioGroupValue }}</p>
  <hr />
  <h2>Transform Tag Test</h2>
  <MyTransformTest message="This component's tag should be transformed to v1-my-transform-test" />
  <p data-testid="transform-test-info">
    Check the DOM: the tag should be &lt;v1-my-transform-test&gt; instead of &lt;my-transform-test&gt;
  </p>
  <hr />
  <HydratedClassTest />
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
