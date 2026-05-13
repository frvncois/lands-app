<script setup lang="ts">
import { ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import DeleteProjectModal from '@/components/modals/DeleteProjectModal.vue'

const showDeleteModal = ref(false)
</script>

<template>
  <button
    class="group flex items-center rounded-xl border border-red-100 hover:bg-red-50 transition-all p-1.5 gap-2 cursor-pointer w-full text-left"
    @click="showDeleteModal = true"
  >
    <div class="shrink-0 flex items-center justify-center h-7 w-7 rounded-lg bg-red-100 text-red-500">
      <TrashIcon class="h-4 w-4" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-red-600">Delete project</p>
    </div>
    <TrashIcon class="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
  </button>

  <Teleport to="body">
    <Transition name="modal-center">
      <DeleteProjectModal v-if="showDeleteModal" @close="showDeleteModal = false" />
    </Transition>
  </Teleport>
</template>
