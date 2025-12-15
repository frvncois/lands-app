import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import EditorView from '@/views/EditorView.vue'
import ProjectSettingsView from '@/views/ProjectSettingsView.vue'
import AccountView from '@/views/AccountView.vue'
import InviteView from '@/views/InviteView.vue'
import OAuthCallbackView from '@/views/OAuthCallbackView.vue'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/invite/:token',
      name: 'invite',
      component: InviteView,
    },
    {
      path: '/oauth/callback',
      name: 'oauth-callback',
      component: OAuthCallbackView,
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      component: AuthLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'auth',
          component: AuthView,
        },
      ],
    },
    {
      path: '/dashboard',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'project/:projectId',
          name: 'editor',
          component: EditorView,
          meta: { requiresProject: true },
        },
        {
          path: 'project/:projectId/settings',
          name: 'settings',
          component: ProjectSettingsView,
          meta: { requiresProject: true },
        },
        {
          path: 'project/:projectId/analytics',
          name: 'analytics',
          component: () => import('@/pages/analytics/AnalyticsPage.vue'),
          meta: { requiresProject: true },
        },
        {
          path: 'project/:projectId/integration',
          name: 'integration',
          component: () => import('@/pages/integrations/IntegrationsPage.vue'),
          meta: { requiresProject: true },
        },
        {
          path: 'account',
          name: 'account',
          component: AccountView,
        },
      ],
    },
    {
      path: '/',
      component: HomeView,
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // Wait for auth to be initialized if still loading
  if (userStore.isLoading) {
    // Give it a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated) {
      // Redirect to auth page
      next({ name: 'auth' })
      return
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (userStore.isAuthenticated) {
      // Redirect to dashboard
      next({ name: 'dashboard' })
      return
    }
  }

  // Check if route requires a project - just validate projectId exists in URL
  // The actual project loading happens in the view components
  if (to.matched.some(record => record.meta.requiresProject)) {
    const projectId = to.params.projectId as string
    if (!projectId) {
      // Redirect to dashboard if no project ID in URL
      next({ name: 'dashboard' })
      return
    }
  }

  next()
})

export default router
