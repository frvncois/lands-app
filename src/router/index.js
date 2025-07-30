import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import EditorView from '../views/EditorView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import AccountView from '@/views/AccountView.vue'
import TeamView from '@/views/TeamView.vue'
import IntegrationsView from '@/views/IntegrationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'projects',
      component: ProjectsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'project',
      component: EditorView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/team/',
      name: 'team',
      component: TeamView,
      meta: { requiresAuth: true }
    },
    {
      path: '/integrations/',
      name: 'integrations',
      component: IntegrationsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/account/',
      name: 'account',
      component: AccountView,
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const accountStore = useAccountStore()
  if (to.meta.requiresAuth) {
    if (!accountStore.isAuthenticated) {
      next(false)
      return
    }
  }
  
  next()
})

export default router