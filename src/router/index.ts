import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLandStore } from '@/stores/land'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import OnboardingLayout from '@/layouts/OnboardingLayout.vue'
import ProjectView from '@/views/dashboard/ProjectView.vue'
import AccountView from '@/views/dashboard/AccountView.vue'
import PlansView from '@/views/dashboard/PlansView.vue'
import PlansSuccessView from '@/views/dashboard/PlansSuccessView.vue'
import SupportView from '@/views/dashboard/SupportView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LostPasswordView from '@/views/auth/LostPasswordView.vue'
import StripeCallbackView from '@/views/auth/StripeCallbackView.vue'
import AcceptInviteView from '@/views/auth/AcceptInviteView.vue'
import OnboardingView from '@/views/onboarding/OnboardingView.vue'
import HomeView from '@/views/storefront/HomeView.vue'
import CheckoutSuccessView from '@/views/checkout/CheckoutSuccessView.vue'
import CheckoutCancelView from '@/views/checkout/CheckoutCancelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/dashboard',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: ProjectView,
        },
        {
          path: 'account',
          component: AccountView,
        },
        {
          path: 'plans',
          component: PlansView,
        },
        {
          path: 'support',
          component: SupportView,
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          component: LoginView,
        },
        {
          path: 'register',
          component: RegisterView,
        },
        {
          path: 'reset',
          component: LostPasswordView,
        },
      ],
    },
    {
      path: '/auth/stripe/callback',
      component: StripeCallbackView,
    },
    {
      path: '/auth/accept-invite',
      component: AcceptInviteView,
    },
    {
      path: '/plans/success',
      component: PlansSuccessView,
    },
    {
      path: '/checkout/success',
      component: CheckoutSuccessView,
    },
    {
      path: '/checkout/cancel',
      component: CheckoutCancelView,
    },
    {
      path: '/onboarding',
      component: OnboardingLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: OnboardingView,
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  // Use cached auth state when available; fall back to session check on first load
  const userStore = useUserStore()
  let isAuthenticated = userStore.isAuthenticated
  if (!isAuthenticated) {
    userStore.isLoading = true
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated = !!session
    userStore.isLoading = false
  }

  if (to.meta.requiresAuth && !isAuthenticated) return '/auth'
  if (to.meta.requiresGuest && isAuthenticated) return '/dashboard'

  if (isAuthenticated) {
    const landStore = useLandStore()

    // Onboarding: skip if user already has lands
    if (to.path === '/onboarding' && landStore.lands.length > 0) return '/dashboard'

    // Dashboard: redirect to onboarding if data is loaded and user has no lands.
    // Skip when an invite is being processed (via URL query param — survives tab refresh).
    const hasInvite = !!to.query.invite
    if (to.path.startsWith('/dashboard') && !landStore.isLoading && landStore.lands.length === 0 && !hasInvite) return '/onboarding'
  }
})

export default router
