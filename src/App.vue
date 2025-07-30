<script setup>
import { onMounted, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useAccountStore } from './stores/account'
import NavMain from './components/global/NavMain.vue'
import AuthMain from './components/auth/AuthMain.vue'
import ProjectPreview from './components/project/ProjectPreview.vue'

const accountStore = useAccountStore()

// Debug logs to check the store state
console.log('🔍 Account Store Methods:', Object.keys(accountStore))
console.log('🔍 Has initialize method:', typeof accountStore.initialize === 'function')
console.log('🔍 Current loading state:', accountStore.loading)
console.log('🔍 Current auth state:', accountStore.isAuthenticated)

// Computed to handle the three states properly
const appState = computed(() => {
  console.log('🔄 Computing app state:', {
    loading: accountStore.loading,
    isAuthenticated: accountStore.isAuthenticated,
    hasSession: accountStore.session
  })
  
  if (accountStore.loading) return 'loading'
  if (accountStore.isAuthenticated) return 'authenticated'
  return 'unauthenticated'
})

onMounted(async () => {
  console.log('🚀 App mounted, initializing auth...')
  
  // Check if initialize method exists
  if (typeof accountStore.initialize === 'function') {
    console.log('✅ Initialize method found, calling...')
    await accountStore.initialize()
    console.log('✅ Initialize completed')
  } else {
    console.error('❌ Initialize method not found in account store!')
    console.log('Available methods:', Object.keys(accountStore))
  }
})
</script>

<template>
  <!-- Loading state - show until auth is initialized -->
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