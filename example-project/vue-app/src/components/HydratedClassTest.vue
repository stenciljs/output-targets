<script setup lang="ts">
import { MyComponent } from 'component-library-vue'
import { ref } from 'vue'

const isHighlighted = ref(false)
const componentRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isHighlighted.value = !isHighlighted.value
}
</script>

<template>
  <div class="hydrated-test">
    <h3>Hydrated Class Preservation Test (Issue #708)</h3>
    <p>Click the button to toggle the "highlighted" class. The "hydrated" class should persist.</p>

    <MyComponent
      ref="componentRef"
      class="static-class"
      :class="{ highlighted: isHighlighted }"
      first="Test"
      last="Component"
    />

    <div class="controls">
      <button @click="toggle" data-testid="toggle-class-btn">
        Toggle Highlighted Class
      </button>
      <p data-testid="class-status">
        isHighlighted: <strong>{{ isHighlighted }}</strong>
      </p>
      <p data-testid="hydrated-status">
        Check the element's classes in DevTools - "hydrated" should always be present
      </p>
    </div>
  </div>
</template>

<style scoped>
.hydrated-test {
  margin: 20px 0;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
}

.controls {
  margin-top: 15px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

:deep(.highlighted) {
  background-color: yellow !important;
  outline: 3px solid orange;
}

:deep(.hydrated) {
  border: 3px solid green;
}

:deep(.static-class) {
  padding: 10px;
}
</style>
