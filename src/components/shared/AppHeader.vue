<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue';
import {
  LinkIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'
import BaseMenu from '../ui/BaseMenu.vue';
import LandsLoading from './LandsLoading.vue';
import IntegrationsModal from '../modals/IntegrationsModal.vue';
import ConfirmLeaveModal from '../modals/ConfirmLeaveModal.vue';
import ConfirmPublishedModal from '../modals/ConfirmPublishedModal.vue';
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { landService } from '@/services/land.service'
import { publishService } from '@/services/publish.service'
import authService from '@/services/auth.service'

const appModals = useAppModals()
const showLeaveModal = ref(false)
const showPublishedModal = ref(false)
const publishStatus = ref<'loading' | 'done' | 'error'>('loading')
const pendingPath = ref<string | null>(null)
const leaveContext = ref<'navigate' | 'close'>('navigate')

const editorStore = useEditorStore()
const landStore = useLandStore()
const themeStore = useThemeStore()
const { addToast } = useToast()
const route = useRoute()
const router = useRouter()

const isSaving = ref(false)

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

watch(() => route.path, () => {
  appModals.close()
})

const removeGuard = router.beforeEach((to, from) => {
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

onUnmounted(removeGuard)

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

function discardChanges() {
  const land = landStore.activeLand
  if (land && editorStore.landSnapshot) {
    landStore.updateLand(land.id, editorStore.landSnapshot)
  }
  if (editorStore.themeSnapshot) {
    themeStore.setTheme(editorStore.themeSnapshot)
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

async function publish() {
  const land = landStore.activeLand
  if (!land) return
  publishStatus.value = 'loading'
  showPublishedModal.value = true
  try {
    await save()
    await publishService.publish(land)
    publishStatus.value = 'done'
  } catch {
    publishStatus.value = 'error'
  }
}

function confirmPublished() {
  showPublishedModal.value = false
  exitEditor()
}

const loggingOut = ref(false)

async function handleLogout() {
  loggingOut.value = true
  await authService.logout()
  setTimeout(() => router.push('/auth'), 1500)
}
</script>

<template>
    <header class="flex justify-between items-center p-2">

        <BaseMenu @logout="handleLogout" />


        <Transition name="modal-title" mode="out-in">

          <!--Preview state-->
          <div v-if="!editorStore.isEditMode && route.path === '/dashboard'" class="flex space-x-2 items-center">
              <BaseButton size="sm" variant="outline" :active="appModals.activeModal === 'integrations'" @click="appModals.activeModal === 'integrations' ? appModals.close() : appModals.openIntegrations()">
                  <PuzzlePieceIcon class="h-4 w-4" />
                  Integrations
              </BaseButton>
              <BaseButton size="sm" variant="solid" @click="enterEditor">
                  <PencilSquareIcon class="h-4 w-4" />
                  Edit
              </BaseButton>
          </div>

          <!--Account state-->
          <div v-else-if="route.path.startsWith('/dashboard/account') || route.path.startsWith('/dashboard/plans')" class="flex space-x-2 items-center">
              <BaseButton size="sm" variant="outline">
                  <QuestionMarkCircleIcon class="h-4 w-4" />
                  Need help?
              </BaseButton>
          </div>

          <!--Editor state-->
          <div v-else-if="editorStore.isEditMode" class="flex">
              <div class="flex justify-end gap-2">
              <BaseButton size="sm" variant="ghost" class="text-gray-400 bg-gray-50">
                  <LinkIcon class="h-3.5 w-3.5" />
                  {{ landStore.activeLand?.handle }}.lands.app
              </BaseButton>
                <BaseButton size="sm" variant="ghost" @click="handleClose">
                    Close Editor
                </BaseButton>
                <BaseButton size="sm" variant="outline" :disabled="isSaving" @click="save">
                    {{ isSaving ? 'Saving…' : 'Save' }}
                </BaseButton>
                <BaseButton size="sm" variant="solid" :disabled="isSaving" @click="publish">
                    <CloudArrowUpIcon class="h-4 w-4" />
                    {{ isSaving ? 'Publishing…' : 'Publish' }}
                </BaseButton>
              </div>
          </div>

        </Transition>

        <!-- Backdrop — closes any open modal on click outside -->
        <Transition name="modal-fade">
          <div
            v-if="appModals.activeModal"
            class="fixed inset-0 z-40"
            @click="appModals.close()"
          />
        </Transition>

        <Transition name="modal-grow">
          <IntegrationsModal v-if="appModals.activeModal === 'integrations'" @close="appModals.close()" />
        </Transition>

        <Transition name="modal-center">
          <ConfirmLeaveModal v-if="showLeaveModal" @confirm="confirmLeave" @cancel="cancelLeave" />
        </Transition>
        <Transition name="modal-center">
          <ConfirmPublishedModal v-if="showPublishedModal" :handle="landStore.activeLand?.handle ?? ''" :status="publishStatus" @close="confirmPublished" />
        </Transition>



    </header>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="loggingOut" class="fixed inset-0 z-[9999] bg-white">
          <LandsLoading />
        </div>
      </Transition>
    </Teleport>

</template>
