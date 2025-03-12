import { createRouter, createWebHistory } from 'vue-router'
import SfcTestsView from './views/SfcTests.vue'
import BasicCompositionView from './views/BasicComposition.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: SfcTestsView
    },
    {
      path: '/legacy',
      component: BasicCompositionView
    }
  ]
})

export default router