<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseModal from '../ui/BaseModal.vue'
import { useLandStore } from '@/stores/land'
import { collaboratorService } from '@/services/collaborator.service'
import type { Land } from '@/types/land'

const emit = defineEmits<{ confirm: [], cancel: [] }>()

const landStore = useLandStore()
const confirmText = ref('')
const isSubmitting = ref(false)
const error = ref('')

// Track chosen new owner (collaborator email) per land id. Empty string = delete the project.
const transferMap = ref<Record<string, string>>(
  Object.fromEntries(landStore.lands.map((l: Land) => [l.id, '']))
)

const canConfirm = computed(() => confirmText.value === 'DELETE')

async function submit() {
  if (!canConfirm.value) return
  isSubmitting.value = true
  error.value = ''
  try {
    await collaboratorService.deleteAccount(transferMap.value)
    emit('confirm')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal max-width="max-w-[480px]" @close="$emit('cancel')">
    <div class="flex flex-col gap-6">

      <!-- Header -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 text-red-500 mb-1">
          <TrashIcon class="h-5 w-5" />
          <h3 class="text-lg font-semibold">Delete account</h3>
        </div>
        <p class="text-sm text-gray-500">
          This action is permanent and cannot be undone. All projects not transferred to a collaborator will be permanently deleted.
        </p>
      </div>

      <!-- Projects list -->
      <div class="flex flex-col gap-3">
        <p class="text-xs font-medium text-gray-500">Your projects</p>
        <div v-if="landStore.lands.length === 0" class="text-xs text-gray-400">No projects found.</div>
        <div
          v-for="land in landStore.lands"
          :key="land.id"
          class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-800">{{ land.title || land.handle }}</span>
            <span class="text-xs text-gray-400">{{ land.handle }}.lands.app</span>
          </div>

          <div v-if="land.collaborators.filter(c => c.status === 'active').length > 0" class="flex flex-col gap-1">
            <p class="text-xs text-gray-400">Transfer ownership to a collaborator (optional)</p>
            <select
              v-model="transferMap[land.id]"
              class="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-gray-400"
            >
              <option value="">Delete this project</option>
              <option
                v-for="c in land.collaborators.filter(c => c.status === 'active')"
                :key="c.id"
                :value="c.email"
              >
                {{ c.email }} ({{ c.role }})
              </option>
            </select>
          </div>
          <p v-else class="text-xs text-red-400">No active collaborators — this project will be deleted.</p>
        </div>
      </div>

      <!-- Confirm input -->
      <div class="flex flex-col gap-2">
        <p class="text-xs text-gray-500">Type <span class="font-semibold text-gray-800">DELETE</span> to confirm</p>
        <BaseInput size="md" label="" v-model="confirmText" placeholder="DELETE" />
      </div>

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <BaseButton variant="outline" size="sm" @click="$emit('cancel')">Cancel</BaseButton>
        <BaseButton
          variant="remove"
          size="sm"
          :disabled="!canConfirm || isSubmitting"
          @click="submit"
        >
          {{ isSubmitting ? 'Processing…' : 'Delete my account' }}
        </BaseButton>
      </div>

    </div>
  </BaseModal>
</template>
