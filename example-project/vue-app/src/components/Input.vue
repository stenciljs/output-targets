<script>
import { defineComponent, ref } from 'vue';
import { MyInput } from 'component-library-vue';

export default defineComponent({
  name: 'Input',
  components: {
    MyInput,
  },
  setup() {
    const inputValue = ref('');
    const changeEvent = ref('');

    const handleChange = (ev) => {
      changeEvent.value = ev.detail.value;
    };

    return {
      inputValue,
      changeEvent,
      handleChange
    };
  },
});
</script>

<style scoped>
.inputResult {
  color: green;
}
</style>

<template>
  <div>
    <MyInput
      v-model="inputValue"
      @myChange="handleChange"
    >
    </MyInput>
    <div class="inputResult">
      <p>Input v-model: {{ inputValue }}</p>
      <p>Change Event: {{ changeEvent }}</p>
    </div>
  </div>
</template>
