<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { landService } from '@/services/land.service'

const emit = defineEmits<{ close: []; deleted: [] }>()

const landStore = useLandStore()
const editorStore = useEditorStore()

const confirmation = ref('')
const isLoading = ref(false)
const error = ref('')

const projectTitle = computed(() => landStore.activeLand?.title ?? '')
const isValid = computed(() => confirmation.value === projectTitle.value)

async function handleDelete() {
  if (!isValid.value || !landStore.activeLand) return
  isLoading.value = true
  error.value = ''
  try {
    const id = landStore.activeLand.id
    await landService.deleteLand(id)
    landStore.removeLand(id)
    editorStore.exitEditMode()
    emit('deleted')
    emit('close')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50 backdrop-blur-lg">
    <div class="modal-card w-full mx-4 bg-white rounded-3xl p-6 max-w-[400px]">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Delete project</h3>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          This action is permanent and cannot be undone. Type <strong class="text-gray-900">{{ projectTitle }}</strong> to confirm.
        </p>
        <div class="flex flex-col gap-2">
          <input
            v-model="confirmation"
            type="text"
            :placeholder="projectTitle"
            class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
          />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton @click="$emit('close')">Cancel</BaseButton>
          <BaseButton variant="remove" :disabled="!isValid || isLoading" @click="handleDelete">
            {{ isLoading ? 'Deleting…' : 'Delete project' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
