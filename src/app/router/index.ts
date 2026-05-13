import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/features/auth/stores/user'
import { useLandStore } from '@/features/lands/stores/land'
import { supabase } from '@/shared/lib/supabase'
import AppLayout from '@/features/dashboard/components/AppLayout.vue'
import AuthLayout from '@/features/auth/components/AuthLayout.vue'
import OnboardingLayout from '@/features/onboarding/components/OnboardingLayout.vue'
import ProjectView from '@/features/dashboard/views/ProjectView.vue'
import AccountView from '@/features/dashboard/views/AccountView.vue'
import PlansView from '@/features/dashboard/views/PlansView.vue'
import PlansSuccessView from '@/features/dashboard/views/PlansSuccessView.vue'
import SupportView from '@/features/dashboard/views/SupportView.vue'
import LoginView from '@/features/auth/views/LoginView.vue'
import RegisterView from '@/features/auth/views/RegisterView.vue'
import LostPasswordView from '@/features/auth/views/LostPasswordView.vue'
import StripeCallbackView from '@/features/auth/views/StripeCallbackView.vue'
import AcceptInviteView from '@/features/auth/views/AcceptInviteView.vue'
import OnboardingView from '@/features/onboarding/views/OnboardingView.vue'
import HomeView from '@/views/storefront/HomeView.vue'
import CheckoutSuccessView from '@/features/plan/views/CheckoutSuccessView.vue'
import CheckoutCancelView from '@/features/plan/views/CheckoutCancelView.vue'

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
