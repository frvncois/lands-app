<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useDashboardDetail } from '@/composables/useDashboardDetail'
import { useToast } from '@/composables/useToast'
import { usePublishFlow } from '@/composables/usePublishFlow'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import LandsDashboard from '@/components/dashboard/LandsDashboard.vue'
import LandsLoading from '@/components/shared/LandsLoading.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import MobileEditorBar from '@/components/editor/MobileEditorBar.vue'
import OnboardingTour from '@/components/shared/OnboardingTour.vue'
import InviteAcceptModal from '@/components/modals/InviteAcceptModal.vue'
import StripeConnectedModal from '@/components/modals/StripeConnectedModal.vue'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()
const landStore = useLandStore()
const appModals = useAppModals()
const { activeDetail: activeDashboardDetail } = useDashboardDetail()
const { addToast, removeToast } = useToast()
const { publish: doPublish } = usePublishFlow()

const unpublishedToastId = ref<string | null>(null)
const showStripeConnectedModal = ref(false)

onMounted(() => {
  if (route.query.stripe === 'connected') {
    showStripeConnectedModal.value = true
    router.replace('/dashboard')
  }
})

function handleStartSelling() {
  showStripeConnectedModal.value = false
  editorStore.enterEditMode()
}

function syncUnpublishedToast() {
  if (editorStore.hasUnpublishedChanges && !editorStore.isEditMode) {
    if (unpublishedToastId.value) return // already showing
    unpublishedToastId.value = addToast('Unpublished changes', 'warning', 0, {
      persistent: true,
      action: {
        label: 'Publish',
        onClick: () => doPublish(),
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
    <!-- Left: dashboard (hidden in editor mode; full-width on mobile) -->
    <div
      class="transition-[width] duration-500 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode
        ? 'w-0'
        : (activeDashboardDetail === 'orders' || activeDashboardDetail === 'monetize')
          ? 'w-full lg:w-[420px]'
          : 'w-full lg:w-72'"
    >
      <LandsDashboard />
    </div>

    <!-- Center: preview
         - Preview mode: hidden on mobile (dashboard fills screen), visible on desktop
         - Editor mode: visible on all screens; bottom padding on mobile for the tab bar -->
    <div
      class="flex-1 min-w-0 overflow-y-auto bg-white border border-gray-200 rounded-xl"
      :class="editorStore.isEditMode ? 'pb-20 lg:pb-0' : 'hidden lg:block'"
    >
      <Transition name="loading-fade" mode="out-in">
        <LandsLoading v-if="landStore.isLoading" />
        <EditorPreview v-else />
      </Transition>
    </div>

    <!-- Right: editor sidebar — desktop only -->
    <div
      class="transition-[width] duration-500 ease-in-out overflow-hidden shrink-0 h-full"
      :class="editorStore.isEditMode ? 'w-0 lg:w-72' : 'w-0'"
    >
      <EditorSidebar />
    </div>

    <!-- Mobile editor tab bar — only shown in editor mode on mobile -->
    <MobileEditorBar v-if="editorStore.isEditMode" />
    <OnboardingTour />
    <InviteAcceptModal />
    <Transition name="modal-center">
      <StripeConnectedModal v-if="showStripeConnectedModal" @close="showStripeConnectedModal = false" @start-selling="handleStartSelling" />
    </Transition>
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
