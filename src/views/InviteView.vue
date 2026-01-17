<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const token = computed(() => route.params.token as string)

const isLoading = ref(true)
const isAccepting = ref(false)
const error = ref('')

interface InviteInfo {
  email: string
  role: string
  project_title: string
  inviter_name: string
  expires_at: string
}

const inviteInfo = ref<InviteInfo | null>(null)

const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUserEmail = computed(() => userStore.user?.email || '')
const emailMismatch = computed(() => {
  if (!inviteInfo.value || !currentUserEmail.value) return false
  return inviteInfo.value.email.toLowerCase() !== currentUserEmail.value.toLowerCase()
})

onMounted(async () => {
  await fetchInviteInfo()
})

async function fetchInviteInfo() {
  isLoading.value = true
  error.value = ''

  try {
    const { data, error: rpcError } = await supabase.rpc('get_invite_info', {
      p_token: token.value
    })

    if (rpcError) throw rpcError

    if (!data.success) {
      error.value = data.error || 'Invalid invite'
      return
    }

    inviteInfo.value = {
      email: data.email || '',
      role: data.role || '',
      project_title: data.project_title || '',
      inviter_name: data.inviter_name || '',
      expires_at: data.expires_at || '',
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load invite'
  } finally {
    isLoading.value = false
  }
}

async function acceptInvite() {
  if (!isAuthenticated.value) {
    // Redirect to auth with return URL
    router.push({ name: 'auth', query: { redirect: route.fullPath } })
    return
  }

  isAccepting.value = true
  error.value = ''

  try {
    const { data, error: rpcError } = await supabase.rpc('accept_invite_by_token', {
      p_token: token.value
    })

    if (rpcError) throw rpcError

    if (!data.success) {
      error.value = data.error || 'Failed to accept invite'
      return
    }

    // Redirect to the project
    router.push({ name: 'designer', params: { projectId: data.project_id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to accept invite'
  } finally {
    isAccepting.value = false
  }
}

function goToAuth() {
  router.push({ name: 'auth', query: { redirect: route.fullPath } })
}

function goToDashboard() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-card border border-border rounded-lg p-8 text-center">
        <div class="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
        <p class="text-sm text-muted-foreground">Loading invite...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !inviteInfo" class="bg-card border border-border rounded-lg p-8 text-center">
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon name="cross-circle" class="text-2xl text-destructive" />
        </div>
        <h1 class="text-lg font-semibold text-foreground mb-2">Invalid Invite</h1>
        <p class="text-sm text-muted-foreground mb-6">{{ error }}</p>
        <button
          class="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          @click="goToDashboard"
        >
          Go to Dashboard
        </button>
      </div>

      <!-- Invite Info -->
      <div v-else-if="inviteInfo" class="bg-card border border-border rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-muted/30 p-6 text-center border-b border-border">
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="users" class="text-2xl text-primary" />
          </div>
          <h1 class="text-lg font-semibold text-foreground">You're invited!</h1>
          <p class="text-sm text-muted-foreground mt-1">
            <span class="font-medium text-foreground">{{ inviteInfo.inviter_name }}</span> invited you to collaborate
          </p>
        </div>

        <!-- Details -->
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-border">
            <span class="text-sm text-muted-foreground">Project</span>
            <span class="text-sm font-medium text-foreground">{{ inviteInfo.project_title }}</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-border">
            <span class="text-sm text-muted-foreground">Role</span>
            <span
              class="px-2 py-0.5 text-xs font-medium rounded-full"
              :class="inviteInfo.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
            >
              {{ inviteInfo.role === 'admin' ? 'Admin' : 'Editor' }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-muted-foreground">Invited email</span>
            <span class="text-sm text-foreground">{{ inviteInfo.email }}</span>
          </div>

          <!-- Email mismatch warning -->
          <div v-if="isAuthenticated && emailMismatch" class="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p class="text-sm text-amber-800">
              <Icon name="warning" class="mr-1" />
              This invite was sent to <strong>{{ inviteInfo.email }}</strong>, but you're logged in as <strong>{{ currentUserEmail }}</strong>.
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 pt-0 space-y-3">
          <div v-show="isAuthenticated">
            <button
              class="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="isAccepting || emailMismatch"
              @click="acceptInvite"
            >
              {{ isAccepting ? 'Accepting...' : 'Accept Invitation' }}
            </button>
            <button
              class="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="goToDashboard"
            >
              Decline
            </button>
          </div>
          <div v-show="!isAuthenticated">
            <p class="text-sm text-center text-muted-foreground mb-4">
              Sign in or create an account to accept this invitation.
            </p>
            <button
              class="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              @click="goToAuth"
            >
              Sign in to Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
