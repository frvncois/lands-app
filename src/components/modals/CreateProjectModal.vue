<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import { useLandStore } from '@/stores/land'
import { useUserStore } from '@/stores/user'
import { buildMinimalMockLand } from '@/lib/mock/landBuilder'

const emit = defineEmits<{ close: [] }>()

const landStore = useLandStore()
const userStore = useUserStore()

const title = ref('')
const handle = ref('')

const isValid = computed(() => title.value.trim().length > 0 && handle.value.trim().length > 0)

function create() {
  if (!isValid.value) return
  const { land } = buildMinimalMockLand({
    user_id: userStore.user?.id,
    title: title.value.trim(),
    handle: handle.value.trim(),
  })
  landStore.addLand(land)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50 backdrop-blur-lg">
    <div class="modal-card w-full mx-4 bg-white rounded-3xl p-6 max-w-[400px]">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create new Land</h3>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <input
            v-model="title"
            type="text"
            placeholder="My new project"
            class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Handle</label>
          <input
            v-model="handle"
            type="text"
            placeholder="my-new-project"
            class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
          />
          <p class="text-xs text-gray-400">{{ handle || 'handle' }}.lands.app</p>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton @click="$emit('close')">Cancel</BaseButton>
          <BaseButton variant="solid" :disabled="!isValid" @click="create">Create</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
