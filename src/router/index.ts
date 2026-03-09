import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import OnboardingLayout from '@/layouts/OnboardingLayout.vue'
import ProjectView from '@/views/dashboard/ProjectView.vue'
import AccountView from '@/views/dashboard/AccountView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LostPasswordView from '@/views/auth/LostPasswordView.vue'
import OnboardingView from '@/views/onboarding/OnboardingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: AppLayout,
      children: [
        {
          path: '',
          component: ProjectView,
        },
        {
          path: 'account',
          component: AccountView,
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
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
      path: '/onboarding',
      component: OnboardingLayout,
      children: [
        {
          path: '',
          component: OnboardingView,
        },
      ],
    },
  ],
})

export default router
