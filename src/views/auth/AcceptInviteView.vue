<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import LandsLoading from '@/components/shared/LandsLoading.vue'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  // Supabase puts the session in the URL hash: #access_token=...&type=invite
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')

  if (type !== 'invite' || !accessToken || !refreshToken) {
    error.value = 'Invalid or expired invite link.'
    return
  }

  // Land ID comes from the query string (?land=) set in the invite redirectTo URL
  const landId = new URLSearchParams(window.location.search).get('land') ?? ''

  // Set flag before setSession so App.vue's loadUserData skips the onboarding redirect
  // while we handle the invite flow ourselves
  if (landId) {
    sessionStorage.setItem('lands_invite_land', landId)
  }

  // Exchange the tokens to establish a session
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (sessionError) {
    sessionStorage.removeItem('lands_invite_land')
    error.value = sessionError.message
    return
  }

  // Clean the hash from the URL before navigating
  history.replaceState(null, '', window.location.pathname + window.location.search)

  // Route to dashboard with invite query param — InviteAcceptModal handles the rest
  if (landId) {
    router.push(`/dashboard?invite=${landId}`)
  } else {
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="flex items-center justify-center w-screen h-screen bg-white">
    <div v-if="error" class="text-center space-y-3">
      <p class="text-sm text-red-500">{{ error }}</p>
      <a href="/auth" class="text-sm text-gray-500 underline">Back to sign in</a>
    </div>
    <LandsLoading v-else />
  </div>
</template>
