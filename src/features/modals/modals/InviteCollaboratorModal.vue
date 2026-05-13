<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { useCollaboratorActions } from '@/features/integrations/composables/useCollaboratorActions'
import type { CollaboratorRole } from '@/features/integrations/types/collaborator'

const emit = defineEmits<{ close: [] }>()

const { invite } = useCollaboratorActions()

const email = ref('')
const role = ref<CollaboratorRole>('editor')
const error = ref('')
const isSending = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValid = computed(() => EMAIL_RE.test(email.value.trim()))

async function send() {
  if (!isValid.value) {
    error.value = 'Enter a valid email address.'
    return
  }
  error.value = ''
  isSending.value = true
  try {
    await invite(email.value.trim(), role.value)
    emit('close')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <BaseModal @close="$emit('close')">
    <div>

      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Invite collaborator</h3>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="name@example.com"
            :disabled="isSending"
            class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04] disabled:opacity-50"
            @keydown.enter="send"
          />
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Role</label>
          <div class="flex gap-2">
            <button
              v-for="r in (['editor', 'admin'] as CollaboratorRole[])"
              :key="r"
              class="flex-1 py-3 text-sm font-medium rounded-xl border transition-colors capitalize"
              :class="role === r
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
              @click="role = r"
            >
              {{ r }}
            </button>
          </div>
          <p class="text-xs text-gray-400">
            <span v-if="role === 'editor'">Can edit content and settings.</span>
            <span v-else>Can edit content, settings and manage integrations.</span>
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton :disabled="isSending" @click="$emit('close')">Cancel</BaseButton>
          <BaseButton variant="solid" :disabled="!isValid || isSending" :loading="isSending" @click="send">Send invite</BaseButton>
        </div>
      </div>

    </div>
  </BaseModal>
</template>
