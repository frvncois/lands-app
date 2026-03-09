<script setup lang="ts">
import { ref, computed } from 'vue'
import { EnvelopeIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import InviteCollaboratorModal from '../modals/InviteCollaboratorModal.vue'
import { useCollaboratorActions } from '@/composables/useCollaboratorActions'
import { useLandStore } from '@/stores/land'
import { PLAN_DETAILS } from '@/types/plan'

const landStore = useLandStore()
const { getCollaborators, remove, resendInvite } = useCollaboratorActions()

const showInviteModal = ref(false)

const collaborators = computed(() => getCollaborators())

const isPaid = computed(() => {
  const plan = landStore.activeLand?.plan ?? 'free'
  return PLAN_DETAILS[plan].plugins
})

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  declined: 'error',
}
</script>

<template>

  <!-- Upgrade gate -->
  <div v-if="!isPaid" class="flex flex-col items-center gap-3 py-8 px-4 text-center">
    <div class="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center">
      <EnvelopeIcon class="h-5 w-5 text-gray-400" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-gray-900">Collaborators require a paid plan</p>
      <p class="text-xs text-gray-400">Upgrade to invite team members to your land.</p>
    </div>
    <BaseButton variant="solid" size="sm">Upgrade to Paid — $4/mo</BaseButton>
  </div>

  <!-- Paid: full UI -->
  <template v-else>

    <!-- Invite button row -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <p class="text-xs font-medium text-gray-500">
        {{ collaborators.length ? `${collaborators.length} member${collaborators.length > 1 ? 's' : ''}` : 'No collaborators yet' }}
      </p>
      <BaseButton variant="outline" size="xs" @click="showInviteModal = true">
        <EnvelopeIcon class="h-3.5 w-3.5" />
        Invite
      </BaseButton>
    </div>

    <!-- Collaborator list -->
    <div class="flex flex-col p-4 gap-2">
      <div
        v-for="c in collaborators"
        :key="c.id"
        class="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <!-- Avatar initials -->
        <div class="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
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
