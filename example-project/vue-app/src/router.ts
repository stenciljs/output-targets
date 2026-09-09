import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import ('./views/SfcTests.vue'),
    },
    {
      path: '/legacy',
      component: () => import ('./views/BasicComposition.vue'),
    }
  ]
})

export default router