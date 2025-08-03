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
    hasSession: !userStore.session,
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
  <!-- DEBUG PANEL - Real-time User Store Display -->
  <div class="debug-panel">
    <h3>🐛 USER STORE DEBUG</h3>
    <div class="debug-section">
      <h4>AUTH STATE</h4>
      <p><strong>Loading:</strong> {{ userStore.loading }}</p>
      <p><strong>Authenticated:</strong> {{ userStore.isAuthenticated }}</p>
      <p><strong>User Email:</strong> {{ userStore.user?.email || 'null' }}</p>
      <p><strong>Email Confirmed:</strong> {{ userStore.user?.email_confirmed_at ? 'Yes' : 'No' }}</p>
      <p><strong>Session:</strong> {{ userStore.session ? 'Active' : 'None' }}</p>
    </div>
    
    <div class="debug-section">
      <h4>PROFILE</h4>
      <p><strong>ID:</strong> {{ userStore.profile?.id || 'null' }}</p>
      <p><strong>Name:</strong> {{ userStore.fullName || 'null' }}</p>
      <p><strong>Email:</strong> {{ userStore.profile?.email || 'null' }}</p>
      <p><strong>Marketing:</strong> {{ userStore.profile?.marketing_emails ? 'Yes' : 'No' }}</p>
    </div>
    
    <div class="debug-section">
      <h4>PROJECTS</h4>
      <p><strong>Total:</strong> {{ userStore.projects?.length || 0 }}</p>
      <p><strong>Current ID:</strong> {{ userStore.currentProjectId || 'null' }}</p>
      <p><strong>Current Name:</strong> {{ userStore.currentProject?.name || 'null' }}</p>
      <p><strong>Data Loading:</strong> {{ userStore.dataLoading }}</p>
    </div>
    
    <div class="debug-section">
      <h4>STATS</h4>
      <p><strong>Total Projects:</strong> {{ userStore.stats?.total_projects || 0 }}</p>
      <p><strong>Owned:</strong> {{ userStore.stats?.owned_projects || 0 }}</p>
      <p><strong>Collaborated:</strong> {{ userStore.stats?.collaborated_projects || 0 }}</p>
      <p><strong>Invitations:</strong> {{ userStore.stats?.pending_invitations || 0 }}</p>
    </div>
    
    <div class="debug-section">
      <h4>RAW DATA</h4>
      <details>
        <summary>Full User Object</summary>
        <pre>{{ JSON.stringify(userStore.user, null, 2) }}</pre>
      </details>
      <details>
        <summary>Full Profile Object</summary>
        <pre>{{ JSON.stringify(userStore.profile, null, 2) }}</pre>
      </details>
      <details>
        <summary>Projects Array</summary>
        <pre>{{ JSON.stringify(userStore.projects, null, 2) }}</pre>
      </details>
    </div>
  </div>

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
/* DEBUG PANEL STYLES */
.debug-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.455);
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 10px;
  overflow-y: auto;
  z-index: 9999;
  border-left: 2px solid #00ff00;
}

.debug-panel h3 {
  margin: 0 0 10px 0;
  color: #ff6b6b;
  text-align: center;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.debug-section {
  margin-bottom: 15px;
  border: 1px solid #333;
  padding: 8px;
  border-radius: 3px;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  color: #ffd93d;
  font-size: 10px;
  text-transform: uppercase;
  border-bottom: 1px solid #444;
  padding-bottom: 2px;
}

.debug-section p {
  margin: 3px 0;
  line-height: 1.3;
}

.debug-section strong {
  color: #6bcf7f;
}

.debug-panel details {
  margin-top: 5px;
}

.debug-panel summary {
  cursor: pointer;
  color: #74c0fc;
  font-size: 10px;
  padding: 2px 0;
}

.debug-panel pre {
  background: #111;
  padding: 5px;
  border-radius: 3px;
  font-size: 9px;
  max-height: 200px;
  overflow-y: auto;
  margin: 5px 0 0 0;
  border: 1px solid #333;
}

/* EXISTING STYLES */
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