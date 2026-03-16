<script setup lang="ts">
import { ref, computed } from 'vue'
import { EnvelopeIcon, TrashIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BasePlanGate from '../ui/BasePlanGate.vue'
import InviteCollaboratorModal from '../modals/InviteCollaboratorModal.vue'
import ConfirmRemoveCollaboratorModal from '../modals/ConfirmRemoveCollaboratorModal.vue'
import { useCollaboratorActions } from '@/composables/useCollaboratorActions'
import { usePlan } from '@/composables/usePlan'

const { getCollaborators, remove } = useCollaboratorActions()
const { canUseCollaborators } = usePlan()

const showInviteModal = ref(false)
const pendingRemoveId = ref<string | null>(null)
const pendingRemoveEmail = ref('')

function confirmRemove(id: string, email: string) {
  pendingRemoveId.value = id
  pendingRemoveEmail.value = email
}

function cancelRemove() {
  pendingRemoveId.value = null
  pendingRemoveEmail.value = ''
}

async function doRemove() {
  if (!pendingRemoveId.value) return
  await remove(pendingRemoveId.value)
  pendingRemoveId.value = null
  pendingRemoveEmail.value = ''
}

const collaborators = computed(() => getCollaborators())

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  declined: 'error',
}
</script>

<template>

  <!-- Upgrade gate -->
  <BasePlanGate
    v-if="!canUseCollaborators"
    title="Collaborators require a paid plan"
    description="Upgrade to invite team members to your land."
  />

  <!-- Paid: full UI -->
  <template v-else>

    <!-- Empty state -->
    <div v-if="!collaborators.length" class="flex flex-col items-center gap-3 py-8 px-4 text-center">
      <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <UserPlusIcon class="h-4 w-4 text-gray-900" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-gray-900">Invite a teammate</p>
        <p class="text-xs text-gray-400 leading-relaxed">Collaborate on your land by inviting team members to view or edit your project.</p>
      </div>
      <BaseButton variant="solid" size="sm" @click="showInviteModal = true">
        <EnvelopeIcon class="h-3.5 w-3.5" /> Invite collaborator
      </BaseButton>
    </div>

    <!-- Invite button row -->
    <div v-else class="flex items-center justify-between p-4">
      <p class="text-xs font-medium text-gray-500">
        {{ collaborators.length }} member{{ collaborators.length > 1 ? 's' : '' }}
      </p>
      <BaseButton variant="outline" size="xs" @click="showInviteModal = true">
        <EnvelopeIcon class="h-3.5 w-3.5" />
        Invite
      </BaseButton>
    </div>

    <!-- Collaborator list -->
    <TransitionGroup v-if="collaborators.length" tag="div" name="collab-item" class="flex flex-col p-4 pt-0 gap-2">
      <div
        v-for="c in collaborators"
        :key="c.id"
        class="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <!-- Avatar initials -->
        <div class="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <span class="text-xs font-medium text-gray-500">{{ c.email[0]?.toUpperCase() }}</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900 truncate">{{ c.email }}</p>
          <div class="flex items-center gap-1 mt-0.5">
            <BaseBadge :variant="c.role === 'admin' ? 'default' : 'info'" size="xs">{{ c.role }}</BaseBadge>
            <BaseBadge :variant="STATUS_BADGE[c.status]" size="xs" dot>{{ c.status }}</BaseBadge>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 shrink-0">
          <BaseButton variant="icon" size="xs" title="Remove" @click="confirmRemove(c.id, c.email)">
            <TrashIcon class="h-3.5 w-3.5" />
          </BaseButton>
        </div>
      </div>
    </TransitionGroup>

  </template>

  <Transition name="modal-center">
    <InviteCollaboratorModal v-if="showInviteModal" @close="showInviteModal = false" />
  </Transition>

  <Transition name="modal-center">
    <ConfirmRemoveCollaboratorModal
      v-if="pendingRemoveId"
      :email="pendingRemoveEmail"
      @confirm="doRemove"
      @cancel="cancelRemove"
    />
  </Transition>

</template>

<style scoped>
.collab-item-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.collab-item-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.collab-item-enter-from   { opacity: 0; transform: translateY(6px); }
.collab-item-leave-to     { opacity: 0; transform: translateY(-4px); }
</style>
