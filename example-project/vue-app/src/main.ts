import { createApp } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import App from './App.vue'
import router from './router'
import './style.css'
import { setTagTransformer } from 'component-library-vue/tag-transformer'

// Configure tag transformation
setTagTransformer((tag: string) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag)
const app = createApp(App)

// Register router components globally
app.component('RouterView', RouterView)
app.component('RouterLink', RouterLink)

app.use(router)
app.mount('#app')
