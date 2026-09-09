<script>
import { defineComponent, ref } from 'vue';
import { MyCheckbox } from 'component-library-vue';

export default defineComponent({
  name: 'Checkbox',
  components: {
    MyCheckbox,
  },
  setup() {
    const inputValue = ref(null);
    const changeEvent = ref(null);

    const handleChange = (ev) => {
      changeEvent.value = ev.detail.nested.value;
    };

    return {
      inputValue,
      changeEvent,
      handleChange,
    };
  },
});
</script>

<style scoped>
.inputResultCheckbox {
  color: green;
}
</style>

<template>
  <div>
    <MyCheckbox v-model="inputValue" @ionChangeNested="handleChange" />
    <div class="inputResultCheckbox">
      <p>Input v-model: {{ inputValue }}</p>
      <p>Change Event: {{ changeEvent }}</p>
    </div>
  </div>
</template>
