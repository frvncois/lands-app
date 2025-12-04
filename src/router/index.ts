import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import EditorView from '@/views/EditorView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import IntegrationView from '@/views/IntegrationView.vue'
import AccountView from '@/views/AccountView.vue'
import InviteView from '@/views/InviteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Invite route (public, but can accept when authenticated)
    {
      path: '/invite/:token',
      name: 'invite',
      component: InviteView,
    },
    // Auth routes (public)
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
    // App routes (protected)
    {
      path: '/',
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
          component: SettingsView,
          meta: { requiresProject: true },
        },
        {
          path: 'project/:projectId/analytics',
          name: 'analytics',
          component: AnalyticsView,
          meta: { requiresProject: true },
        },
        {
          path: 'project/:projectId/integration',
          name: 'integration',
          component: IntegrationView,
          meta: { requiresProject: true },
        },
        {
          path: 'account',
          name: 'account',
          component: AccountView,
        },
      ],
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
