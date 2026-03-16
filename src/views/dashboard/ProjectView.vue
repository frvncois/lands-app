<script setup lang="ts">
import { watch, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useToast } from '@/composables/useToast'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import LandsDashboard from '@/components/dashboard/LandsDashboard.vue'
import LandsLoading from '@/components/shared/LandsLoading.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import OnboardingTour from '@/components/shared/OnboardingTour.vue'
import InviteAcceptModal from '@/components/modals/InviteAcceptModal.vue'

const editorStore = useEditorStore()
const landStore = useLandStore()
const appModals = useAppModals()
const { addToast, removeToast } = useToast()

const unpublishedToastId = ref<string | null>(null)

function syncUnpublishedToast() {
  if (editorStore.hasUnpublishedChanges && !editorStore.isEditMode) {
    if (unpublishedToastId.value) return // already showing
    unpublishedToastId.value = addToast('Unpublished changes', 'warning', 0, {
      persistent: true,
      action: {
        label: 'Publish',
        onClick: () => { appModals.publishTrigger++ },
      },
    })
  } else if (unpublishedToastId.value) {
    removeToast(unpublishedToastId.value)
    unpublishedToastId.value = null
  }
}

watch(() => editorStore.hasUnpublishedChanges, syncUnpublishedToast)
watch(() => editorStore.isEditMode, syncUnpublishedToast)
</script>

<template>
  <div class="flex h-full relative">
    <!-- Left: dashboard sidebar -->
    <div
      class="transition-[width] duration-500 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode ? 'w-0' : (appModals.activeDashboardDetail === 'orders' || appModals.activeDashboardDetail === 'monetize') ? 'w-[420px]' : 'w-72'"
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
      class="transition-[width] duration-500 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode ? 'w-72' : 'w-0'"
    >
      <EditorSidebar />
    </div>
    <OnboardingTour />
    <InviteAcceptModal />
  </div>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
