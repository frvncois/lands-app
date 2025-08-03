<script setup>
import { onMounted, computed, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import NavMain from './components/global/NavMain.vue'
import AuthMain from './components/auth/AuthMain.vue'
import ProjectPreview from './components/project/ProjectPreview.vue'
import AlertStatus from './components/alert/AlertStatus.vue'
import { useAlertStore } from './stores/alert'

const userStore = useUserStore()
const alertStore = useAlertStore()
const router = useRouter()

// Reactive app state computation
const appState = computed(() => {
  console.log('🔄 Computing app state:', {
    loading: userStore.loading,
    isAuthenticated: userStore.isAuthenticated,
    hasSession: !!userStore.session,
    user: userStore.user
  })
  
  if (userStore.loading) return 'loading'
  
  if (userStore.isAuthenticated) {
    const user = userStore.user
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

// Watch for auth changes and navigate accordingly
watch(
  () => userStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    console.log('🔄 Auth state changed:', { isAuthenticated, wasAuthenticated })
    
    // Only navigate when user becomes authenticated with verified email
    if (isAuthenticated && !wasAuthenticated) {
      const user = userStore.user
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
  console.log('🚀 App mounted, initializing user store...')
  
  // ONLY App.vue loads data - views just use what's already loaded
  await userStore.initialize()
  console.log('✅ All user data loaded and ready')
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

  <!-- Authenticated state - pass reactive store data down -->
  <main v-else-if="appState === 'authenticated'">
    <NavMain 
      :user="userStore.user"
      :profile="userStore.profile"
      :projects="userStore.projects"
      :current-project="userStore.currentProject"
      :user-store="userStore"
    />
    <RouterView 
      :user-store="userStore"
    />
    <ProjectPreview 
      :user-store="userStore"
    />
    <AlertStatus />
  </main>

  <!-- Unauthenticated state -->
  <main v-else>
    <AuthMain 
      :user-store="userStore"
    />
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
