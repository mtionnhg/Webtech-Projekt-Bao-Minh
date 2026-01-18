import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ideation',
    },
    {
      path: '/ideation',
      name: 'ideation',
      component: () => import('../views/IdeationView.vue'),
    },
    {
      path: '/workflow',
      name: 'workflow',
      component: () => import('../views/WorkflowView.vue'),
    },
    {
      path: '/content/:id',
      name: 'content-detail',
      component: () => import('../views/ContentDetailView.vue'),
    },
    {
      path: '/tracking',
      name: 'tracking',
      component: () => import('../views/TrackingView.vue'),
    },
  ],
})

export default router
