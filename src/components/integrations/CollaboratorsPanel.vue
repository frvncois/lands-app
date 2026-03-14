<script setup lang="ts">
import { ref, computed } from 'vue'
import { EnvelopeIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BasePlanGate from '../ui/BasePlanGate.vue'
import InviteCollaboratorModal from '../modals/InviteCollaboratorModal.vue'
import { useCollaboratorActions } from '@/composables/useCollaboratorActions'
import { usePlan } from '@/composables/usePlan'

const { getCollaborators, remove, resendInvite } = useCollaboratorActions()
const { canUseCollaborators } = usePlan()

const showInviteModal = ref(false)

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

    <!-- Invite button row -->
    <div class="flex items-center justify-between p-4">
      <p class="text-xs font-medium text-gray-500">
        {{ collaborators.length ? `${collaborators.length} member${collaborators.length > 1 ? 's' : ''}` : 'No collaborators yet' }}
      </p>
      <BaseButton variant="outline" size="xs" @click="showInviteModal = true">
        <EnvelopeIcon class="h-3.5 w-3.5" />
        Invite
      </BaseButton>
    </div>

    <!-- Collaborator list -->
    <div class="flex flex-col p-4 pt-0 gap-2">
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
          <BaseButton
            v-if="c.status === 'pending'"
            variant="icon"
            size="xs"
            title="Resend invite"
            @click="resendInvite(c.id)"
          >
            <ArrowPathIcon class="h-3.5 w-3.5" />
          </BaseButton>
          <BaseButton variant="icon" size="xs" title="Remove" @click="remove(c.id)">
            <TrashIcon class="h-3.5 w-3.5" />
          </BaseButton>
        </div>
      </div>
    </div>

  </template>

  <Transition name="modal-center">
    <InviteCollaboratorModal v-if="showInviteModal" @close="showInviteModal = false" />
  </Transition>

</template>
