import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useLandStore } from '@/features/lands/stores/land'
import { useThemeStore } from '@/features/theme/stores/theme'
import { useAppModals } from '@/features/modals/composables/useAppModals'
import { useToast } from '@/shared/composables/useToast'
import { landService } from '@/features/lands/services/land.service'
import { publishService } from '@/features/integrations/services/publish.service'

// ─── Singleton state ──────────────────────────────────────────────────────────
const isSaving = ref(false)
const isPublishing = ref(false)
const publishStatus = ref<'loading' | 'done' | 'error'>('loading')
const hasPublishedClean = ref(false)
const showUpToDate = ref(false)
const pendingPath = ref<string | null>(null)
const leaveContext = ref<'navigate' | 'close'>('navigate')
const showLeaveModal = ref(false)
const showPublishedModal = ref(false)
let upToDateTimer: ReturnType<typeof setTimeout> | null = null
let initialized = false

export function usePublishFlow() {
  const editorStore = useEditorStore()
  const landStore = useLandStore()
  const themeStore = useThemeStore()
  const appModals = useAppModals()
  const { addToast } = useToast()
  const router = useRouter()

  const canPublish = computed(() =>
    !isSaving.value && !isPublishing.value &&
    !(hasPublishedClean.value && !editorStore.isDirty && !editorStore.hasUnpublishedChanges)
  )

  function showUpToDateHint() {
    if (upToDateTimer) clearTimeout(upToDateTimer)
    showUpToDate.value = true
    upToDateTimer = setTimeout(() => { showUpToDate.value = false }, 2500)
  }

  async function save() {
    const land = landStore.activeLand
    if (!land) return
    isSaving.value = true
    try {
      await landService.save(land.id, {
        sections: land.sections,
        theme: themeStore.theme ?? land.theme,
        title: land.title,
        handle: land.handle,
      })
      editorStore.markClean()
      editorStore.takeSnapshot(landStore.activeLand!, themeStore.theme)
      addToast('Changes saved')
    } catch {
      addToast('Failed to save — please try again', 'error')
    } finally {
      isSaving.value = false
    }
  }

  async function publish() {
    const land = landStore.activeLand
    if (!land) return
    publishStatus.value = 'loading'
    showPublishedModal.value = true
    isPublishing.value = true
    try {
      await save()
      await publishService.publish(land)
      await landService.updateLand(land.id, { is_published: true })
      landStore.updateLand(land.id, { is_published: true })
      editorStore.markPublished()
      hasPublishedClean.value = true
      publishStatus.value = 'done'
    } catch {
      publishStatus.value = 'error'
    } finally {
      isPublishing.value = false
    }
  }

  function discardChanges() {
    const land = landStore.activeLand
    if (land && editorStore.landSnapshot) {
      landStore.updateLand(land.id, editorStore.landSnapshot)
    }
    if (editorStore.themeSnapshot) {
      themeStore.setTheme(editorStore.themeSnapshot)
    }
  }

  function enterEditor() {
    appModals.close()
    editorStore.takeSnapshot(landStore.activeLand!, themeStore.theme)
    editorStore.enterEditMode()
  }

  function exitEditor() {
    editorStore.exitEditMode()
  }

  function handleClose() {
    if (editorStore.isDirty) {
      leaveContext.value = 'close'
      showLeaveModal.value = true
    } else {
      exitEditor()
    }
  }

  function confirmLeave() {
    showLeaveModal.value = false
    discardChanges()
    exitEditor()
    if (leaveContext.value === 'navigate') {
      const path = pendingPath.value
      pendingPath.value = null
      if (path) router.push(path)
    }
  }

  function cancelLeave() {
    showLeaveModal.value = false
    pendingPath.value = null
  }

  function confirmPublished() {
    showPublishedModal.value = false
    exitEditor()
  }

  if (!initialized) {
    initialized = true

    watch([() => editorStore.isDirty, () => editorStore.hasUnpublishedChanges], ([dirty, unpub]) => {
      if (dirty || unpub) hasPublishedClean.value = false
    })

    router.beforeEach((to, from) => {
      if (editorStore.isEditMode && to.path !== from.path) {
        if (editorStore.isDirty) {
          pendingPath.value = to.path
          leaveContext.value = 'navigate'
          showLeaveModal.value = true
          return false
        }
        exitEditor()
      }
    })
  }

  return {
    isSaving,
    isPublishing,
    publishStatus,
    hasPublishedClean,
    showUpToDate,
    pendingPath,
    leaveContext,
    showLeaveModal,
    showPublishedModal,
    canPublish,
    save,
    publish,
    discardChanges,
    enterEditor,
    exitEditor,
    handleClose,
    confirmLeave,
    cancelLeave,
    confirmPublished,
    showUpToDateHint,
  }
}
