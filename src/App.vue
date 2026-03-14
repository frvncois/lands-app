<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user'
import { useLandStore } from '@/stores/land'
import { useThemeStore } from '@/stores/theme'
import { useThemeVars } from '@/composables/useThemeVars'
import { useKeyboardShortcuts } from '@/composables/useKeyboard'
import { userService } from '@/services/user.service'
import { landService } from '@/services/land.service'
import BaseToastContainer from '@/components/ui/BaseToastContainer.vue'

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
  } finally {
    landStore.isLoading = false
  }
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) await loadUserData()

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && !userStore.isAuthenticated) {
      await loadUserData()
    } else if (event === 'SIGNED_OUT') {
      userStore.clearUser()
      landStore.clearLands()
      themeStore.clearTheme()
    }
  })
})
</script>

<template>
  <RouterView />
  <BaseToastContainer />
</template>
