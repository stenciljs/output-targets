import { createApp } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Register router components globally
app.component('RouterView', RouterView)
app.component('RouterLink', RouterLink)

app.use(router)
app.mount('#app')
