import { setTagTransformer } from 'component-library-vue'

export default defineNuxtPlugin(() => {
  // Configure tag transformation
  setTagTransformer((tag) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag)
})
