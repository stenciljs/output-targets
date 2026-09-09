<script setup lang="ts">
import { MyList, MyListItem } from 'component-library-vue'
import { ref } from 'vue'

const ids = ['a', 'b', 'c']
const selected = ref('a')
</script>

<template>
  <div class="reactive-class-test">
    <h3>Reactive Class Removal Test (Issue #835)</h3>
    <p>Selecting an item should leave exactly one item with the "is-active" class.</p>

    <MyList>
      <MyListItem
        v-for="id in ids"
        :key="id"
        :data-testid="`reactive-item-${id}`"
        :class="{ 'is-active': selected === id }"
      >
        item {{ id }}{{ selected === id ? ' (selected)' : '' }}
      </MyListItem>
    </MyList>

    <div class="controls">
      <button
        v-for="id in ids"
        :key="`select-${id}`"
        :data-testid="`select-item-${id}-btn`"
        @click="selected = id"
      >
        Select {{ id }}
      </button>
      <p data-testid="selected-item">
        selected: <strong>{{ selected }}</strong>
      </p>
    </div>
  </div>
</template>

<style scoped>
.reactive-class-test {
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

:deep(.is-active) {
  outline: 3px solid orange;
}
</style>
