<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import { COLLABORATOR_ROLE_INFO } from '@/types/project'
import type { CollaboratorRole } from '@/types/project'
import { Button, Avatar, Badge } from '@/components/ui'

const props = defineProps<{
  projectId: string
}>()

const projectsStore = useProjectsStore()
const userStore = useUserStore()

const showRoleDropdown = ref<string | null>(null)

const collaborators = computed(() => projectsStore.getProjectCollaborators(props.projectId))
const pendingInvites = computed(() => projectsStore.getPendingInvites(props.projectId))
const currentUser = computed(() => userStore.user)

onMounted(() => {
  projectsStore.fetchCollaborators(props.projectId)
  projectsStore.fetchCollaboratorInvites(props.projectId)
})

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
</script>

<template>
  <div class="p-5 space-y-4">
    <!-- Owner (current user) -->
    <div class="flex items-center gap-3 p-3 border border-border rounded-xl">
      <Avatar
        :src="currentUser?.avatar"
        :name="currentUser?.name"
        :email="currentUser?.email"
        size="md"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-foreground truncate">
          {{ currentUser?.name || 'You' }}
        </p>
        <p class="text-xs text-muted-foreground truncate">
          {{ currentUser?.email }}
        </p>
      </div>
      <Badge
        variant="secondary"
        size="xs"
      >
        Owner
      </Badge>
    </div>

    <!-- Collaborators list -->
    <div
      v-if="collaborators.length > 0"
      class="space-y-2"
    >
      <p class="text-xxs font-mono uppercase text-muted-foreground">
        Team Members ({{ collaborators.length }})
      </p>
      <div class="space-y-2">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="flex items-center gap-3 p-3 border border-border rounded-xl"
        >
          <Avatar
            :src="collaborator.avatar"
            :name="collaborator.name"
            :email="collaborator.email"
            size="md"
          />
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
            <Button
              variant="secondary"
              size="xs"
              @click="showRoleDropdown = showRoleDropdown === collaborator.id ? null : collaborator.id"
            >
              {{ COLLABORATOR_ROLE_INFO[collaborator.role].label }}
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            <!-- Dropdown menu -->
            <div
              v-if="showRoleDropdown === collaborator.id"
              class="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg z-10 p-1"
            >
              <button
                v-for="(info, roleKey) in COLLABORATOR_ROLE_INFO"
                :key="roleKey"
                class="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-accent transition-colors"
                :class="collaborator.role === roleKey ? 'text-primary' : 'text-foreground'"
                @click="handleChangeRole(collaborator.id, roleKey)"
              >
                {{ info.label }}
              </button>
              <div class="border-t border-border my-1" />
              <button
                class="w-full px-3 py-2 text-left text-xs rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
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
    <div
      v-if="pendingInvites.length > 0"
      class="space-y-2"
    >
      <p class="text-xxs font-mono uppercase text-muted-foreground">
        Pending Invites ({{ pendingInvites.length }})
      </p>
      <div class="space-y-2">
        <div
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="flex items-center gap-3 p-3 border border-dashed border-border rounded-xl"
        >
          <Avatar
            :email="invite.email"
            size="md"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">
              {{ invite.email }}
            </p>
            <p class="text-xs text-muted-foreground">
              Invited as {{ COLLABORATOR_ROLE_INFO[invite.role].label }} · Expires {{ formatDate(invite.expiresAt) }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Resend invite"
              @click="handleResendInvite(invite.id)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="hover:text-destructive hover:bg-destructive/10"
              title="Cancel invite"
              @click="handleCancelInvite(invite.id)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="collaborators.length === 0 && pendingInvites.length === 0"
      class="text-center py-4"
    >
      <p class="text-xs text-muted-foreground">
        No collaborators yet
      </p>
    </div>

    <!-- Click outside to close dropdown -->
    <div
      v-if="showRoleDropdown"
      class="fixed inset-0 z-0"
      @click="showRoleDropdown = null"
    />
  </div>
</template>
