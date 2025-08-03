// FIXED: Router configuration in /src/router/index.js
// Replace the existing router configuration:

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
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
      // FIXED: Updated route to handle UUID project IDs
      path: '/projects/:id',
      name: 'project',
      component: EditorView,
      props: route => ({
        // FIXED: Pass ID as string to handle both numeric and UUID IDs
        id: String(route.params.id)
      }),
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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth) {
    // Enhanced validation with JWT check
    const isValidSession = await userStore.validateSession()
    
    if (!isValidSession) {
      console.log('❌ Invalid session, blocking route access')
      next(false)
      return
    }
  }
  
  next()
})

export default router