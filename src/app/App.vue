<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/shared/lib/supabase'
import { useUserStore } from '@/features/auth/stores/user'
import { useLandStore } from '@/features/lands/stores/land'
import { useThemeStore } from '@/features/theme/stores/theme'
import { useThemeVars } from '@/features/theme/composables/useThemeVars'
import { useKeyboardShortcuts } from '@/shared/composables/useKeyboard'
import { userService } from '@/features/auth/services/user.service'
import { landService } from '@/features/lands/services/land.service'
import BaseToastContainer from '@/shared/ui/BaseToastContainer.vue'

const router = useRouter()
const userStore = useUserStore()
const landStore = useLandStore()
const themeStore = useThemeStore()

useThemeVars()
useKeyboardShortcuts()

async function loadUserData() {
  landStore.isLoading = true
  try {
    const [user, lands] = await Promise.all([
      userService.getMe(),
      landService.getMyLands(),
    ])
    userStore.setUser(user)
    landStore.setLands(lands)
    if (landStore.activeLand?.theme) {
      themeStore.setTheme(landStore.activeLand.theme)
    }
    // Redirect to onboarding if user has no lands.
    // Skip during invite acceptance — AcceptInviteView sets this flag.
    if (landStore.lands.length === 0 && router.currentRoute.value.path !== '/onboarding') {
      if (!sessionStorage.getItem('lands_invite_land')) {
        router.push('/onboarding')
      }
    }
  } finally {
    landStore.isLoading = false
  }
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    await loadUserData()
  } else if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/auth')
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && !userStore.isAuthenticated) {
      await loadUserData()
    } else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      userStore.clearUser()
      landStore.clearLands()
      themeStore.clearTheme()
      router.push('/auth')
    }
  })
})
</script>

<template>
  <RouterView />
  <BaseToastContainer />
</template>
