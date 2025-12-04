<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import { COLLABORATOR_ROLE_INFO } from '@/types/project'
import type { CollaboratorRole } from '@/types/project'
import InviteCollaborator from '@/components/modal/InviteCollaborator.vue'

const props = defineProps<{
  projectId: string
}>()

const projectsStore = useProjectsStore()
const userStore = useUserStore()

const showInviteModal = ref(false)
const showRoleDropdown = ref<string | null>(null)

const collaborators = computed(() => projectsStore.getProjectCollaborators(props.projectId))
const pendingInvites = computed(() => projectsStore.getPendingInvites(props.projectId))
const currentUser = computed(() => userStore.user)

onMounted(() => {
  projectsStore.fetchCollaborators(props.projectId)
  projectsStore.fetchCollaboratorInvites(props.projectId)
})

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return '?'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function handleChangeRole(collaboratorId: string, newRole: CollaboratorRole) {
  await projectsStore.updateCollaboratorRole(collaboratorId, newRole)
  showRoleDropdown.value = null
}

async function handleRemoveCollaborator(collaboratorId: string) {
  if (confirm('Are you sure you want to remove this collaborator?')) {
    await projectsStore.removeCollaborator(collaboratorId)
  }
}

async function handleCancelInvite(inviteId: string) {
  if (confirm('Are you sure you want to cancel this invite?')) {
    await projectsStore.cancelInvite(inviteId)
  }
}

async function handleResendInvite(inviteId: string) {
  await projectsStore.resendInvite(inviteId)
}

function handleInvited() {
  // Refresh invites after successful invite
  projectsStore.fetchCollaboratorInvites(props.projectId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-foreground">Collaborators</h3>
        <p class="text-sm text-muted-foreground">
          Invite others to work on this project with you
        </p>
      </div>
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
        @click="showInviteModal = true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Invite
      </button>
    </div>

    <!-- Owner (current user) -->
    <div class="space-y-3">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</p>
      <div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <div
          v-if="currentUser?.avatar"
          class="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
          :style="{ backgroundImage: `url(${currentUser.avatar})` }"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0"
        >
          {{ getInitials(currentUser?.name, currentUser?.email) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">
            {{ currentUser?.name || 'You' }}
          </p>
          <p class="text-xs text-muted-foreground truncate">{{ currentUser?.email }}</p>
        </div>
        <span class="px-2 py-1 text-xs font-medium text-foreground bg-muted rounded">
          Owner
        </span>
      </div>
    </div>

    <!-- Collaborators list -->
    <div v-if="collaborators.length > 0" class="space-y-3">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Team Members ({{ collaborators.length }})
      </p>
      <div class="space-y-2">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
        >
          <div
            v-if="collaborator.avatar"
            class="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
            :style="{ backgroundImage: `url(${collaborator.avatar})` }"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0"
          >
            {{ getInitials(collaborator.name, collaborator.email) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">
              {{ collaborator.name || collaborator.email }}
            </p>
            <p class="text-xs text-muted-foreground truncate">
              Joined {{ formatDate(collaborator.joinedAt) }}
            </p>
          </div>

          <!-- Role dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded transition-colors"
              @click="showRoleDropdown = showRoleDropdown === collaborator.id ? null : collaborator.id"
            >
              {{ COLLABORATOR_ROLE_INFO[collaborator.role].label }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="showRoleDropdown === collaborator.id"
              class="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-10 py-1"
            >
              <button
                v-for="(info, roleKey) in COLLABORATOR_ROLE_INFO"
                :key="roleKey"
                class="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                :class="collaborator.role === roleKey ? 'text-primary' : 'text-foreground'"
                @click="handleChangeRole(collaborator.id, roleKey)"
              >
                {{ info.label }}
              </button>
              <div class="border-t border-border my-1"></div>
              <button
                class="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                @click="handleRemoveCollaborator(collaborator.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending invites -->
    <div v-if="pendingInvites.length > 0" class="space-y-3">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Pending Invites ({{ pendingInvites.length }})
      </p>
      <div class="space-y-2">
        <div
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg"
        >
          <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold shrink-0">
            {{ getInitials(undefined, invite.email) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ invite.email }}</p>
            <p class="text-xs text-muted-foreground">
              Invited as {{ COLLABORATOR_ROLE_INFO[invite.role].label }} · Expires {{ formatDate(invite.expiresAt) }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
              title="Resend invite"
              @click="handleResendInvite(invite.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              class="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
              title="Cancel invite"
              @click="handleCancelInvite(invite.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="collaborators.length === 0 && pendingInvites.length === 0"
      class="text-center py-8"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p class="text-sm text-muted-foreground">No collaborators yet</p>
      <p class="text-xs text-muted-foreground mt-1">Invite team members to work together on this project</p>
    </div>

    <!-- Click outside to close dropdown -->
    <div
      v-if="showRoleDropdown"
      class="fixed inset-0 z-0"
      @click="showRoleDropdown = null"
    />

    <!-- Invite Modal -->
    <InviteCollaborator
      v-model:open="showInviteModal"
      :project-id="projectId"
      @invited="handleInvited"
    />
  </div>
</template>
