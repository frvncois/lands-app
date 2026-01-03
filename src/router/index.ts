import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DesignerView from '@/views/DesignerView.vue'
import ProjectSettingsView from '@/views/ProjectSettingsView.vue'
import AccountView from '@/views/AccountView.vue'
import SupportView from '@/views/SupportView.vue'
import InviteView from '@/views/InviteView.vue'
import OAuthCallbackView from '@/views/OAuthCallbackView.vue'

import HomeView from '@/views/HomeView.vue'

const DEBUG_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === 'true'

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
          name: 'designer',
          component: DesignerView,
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
          path: 'account',
          name: 'account',
          component: AccountView,
        },
        {
          path: 'support',
          name: 'support',
          component: SupportView,
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
// CRITICAL: This guard NEVER awaits - it must complete synchronously
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (DEBUG_AUTH) {
    console.log('[Router Guard]', {
      to: to.name,
      from: from.name,
      authStatus: userStore.authStatus,
      isAuthenticated: userStore.isAuthenticated,
    })
  }

  // FIRE-AND-FORGET: Start hydration if not started (non-blocking)
  userStore.ensureHydrationStarted()

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // If auth status is unknown, allow navigation (UI will self-correct)
    // If explicitly unauthenticated, redirect to login
    if (userStore.authStatus === 'unauthenticated') {
      if (DEBUG_AUTH) {
        console.log('[Router Guard] Auth required but unauthenticated, redirecting to auth')
      }
      next({ name: 'auth' })
      return
    }

    // authStatus is 'unknown' or 'authenticated' → allow
    // If 'unknown', protected page will handle showing skeleton
    if (DEBUG_AUTH && userStore.authStatus === 'unknown') {
      console.log('[Router Guard] Auth status unknown, allowing navigation (UI will self-correct)')
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    // Only redirect if explicitly authenticated
    if (userStore.authStatus === 'authenticated') {
      if (DEBUG_AUTH) {
        console.log('[Router Guard] Guest route but authenticated, redirecting to dashboard')
      }
      next({ name: 'dashboard' })
      return
    }

    // authStatus is 'unknown' or 'unauthenticated' → allow
  }

  // Check if route requires a project - just validate projectId exists in URL
  // The actual project loading happens in the view components
  if (to.matched.some(record => record.meta.requiresProject)) {
    const projectId = to.params.projectId as string
    if (!projectId) {
      if (DEBUG_AUTH) {
        console.log('[Router Guard] Project route but no projectId, redirecting to dashboard')
      }
      next({ name: 'dashboard' })
      return
    }
  }

  next()
})

export default router
