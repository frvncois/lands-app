<script setup>
import { onMounted, computed, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAccountStore } from './stores/account'
import NavMain from './components/global/NavMain.vue'
import AuthMain from './components/auth/AuthMain.vue'
import ProjectPreview from './components/project/ProjectPreview.vue'
import AlertStatus from './components/alert/AlertStatus.vue'
import { useAlertStore } from './stores/alert'

const accountStore = useAccountStore()
const alertStore = useAlertStore()
const router = useRouter()

// FIXED: Simplified app state logic
const appState = computed(() => {
  console.log('🔄 Computing app state:', {
    loading: accountStore.loading,
    isAuthenticated: accountStore.isAuthenticated,
    hasSession: !!accountStore.session,
    user: accountStore.user
  })
  
  if (accountStore.loading) return 'loading'
  
  // FIXED: Simple check - if authenticated with valid session, show app
  if (accountStore.isAuthenticated) {
    const user = accountStore.user
    console.log('👤 User authenticated:', user?.email)
    
    // Check if email is confirmed
    const emailConfirmed = user?.email_confirmed_at !== null
    console.log('📧 Email confirmed:', emailConfirmed)
    
    if (!emailConfirmed) {
      console.log('🔄 Email not confirmed, staying on auth screen')
      return 'unauthenticated'
    }
    
    return 'authenticated'
  }
  
  return 'unauthenticated'
})

// FIXED: Simple navigation watcher - only navigate when truly authenticated
watch(
  () => accountStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    console.log('🔄 Auth state changed:', { isAuthenticated, wasAuthenticated })
    
    // Only navigate when user becomes authenticated with verified email
    if (isAuthenticated && !wasAuthenticated) {
      const user = accountStore.user
      const emailConfirmed = user?.email_confirmed_at !== null
      
      if (emailConfirmed) {
        console.log('✅ User authenticated with verified email, navigating to home')
        router.push('/')
      } else {
        console.log('📧 User authenticated but email not verified, staying on auth')
      }
    }
  }
)

onMounted(async () => {
  console.log('🚀 App mounted, initializing auth...')
  
  if (typeof accountStore.initialize === 'function') {
    console.log('✅ Initialize method found, calling...')
    await accountStore.initialize()
    console.log('✅ Initialize completed')
  } else {
    console.error('❌ Initialize method not found in account store!')
  }
})
</script>

<template>
  <!-- Loading state -->
  <main v-if="appState === 'loading'" class="loading">
    <div class="spinner">
      <div class="spinner-icon"></div>
      <p>Loading...</p>
    </div>
  </main>

  <!-- Authenticated state -->
  <main v-else-if="appState === 'authenticated'">
    <NavMain />
    <RouterView />
    <ProjectPreview/>
    <AlertStatus />
  </main>

  <!-- Unauthenticated state -->
  <main v-else>
    <AuthMain />
  </main>
</template>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--dark);
  color: var(--light);
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.spinner-icon {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border);
  border-top: 2px solid var(--light);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner p {
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>