<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import LandsDashboard from '@/components/dashboard/LandsDashboard.vue'
import LandsLoading from '@/components/shared/LandsLoading.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'

const editorStore = useEditorStore()
const landStore = useLandStore()
</script>

<template>
  <div class="flex h-full">
    <!-- Left: dashboard sidebar -->
    <div
      class="transition-[width] duration-300 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode ? 'w-0' : 'w-72'"
    >
      <LandsDashboard />
    </div>

    <!-- Center: preview -->
    <div class="flex-1 min-w-0 overflow-y-auto bg-white border border-gray-200 rounded-xl">
      <Transition name="loading-fade" mode="out-in">
        <LandsLoading v-if="landStore.isLoading" />
        <EditorPreview v-else />
      </Transition>
    </div>

    <!-- Right: editor sidebar -->
    <div
      class="transition-[width] duration-300 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode ? 'w-72' : 'w-0'"
    >
      <EditorSidebar v-if="editorStore.isEditMode" />
    </div>
  </div>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
