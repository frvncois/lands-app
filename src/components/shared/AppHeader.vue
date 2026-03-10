<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue';
import {
  LinkIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import BaseMenu from '../ui/BaseMenu.vue';
import PluginsModal from '../modals/PluginsModal.vue';
import SettingsModal from '../modals/SettingsModal.vue';
import EditorModal from '../modals/EditorModal.vue';
import ConfirmLeaveModal from '../modals/ConfirmLeaveModal.vue';
import ConfirmPublishedModal from '../modals/ConfirmPublishedModal.vue';
import { useProjectStore } from '@/stores/project'
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { useThemeStore } from '@/stores/theme'
import { landService } from '@/services/land.service'
import type { Land } from '@/types/land'
import type { LandTheme } from '@/types/theme'

const activeModal = ref<'plugins' | 'settings' | null>(null)
const showLeaveModal = ref(false)
const showPublishedModal = ref(false)
const pendingPath = ref<string | null>(null)
// 'navigate' = router guard triggered, 'close' = user clicked Close with dirty state
const leaveContext = ref<'navigate' | 'close'>('navigate')

const project = useProjectStore()
const editorStore = useEditorStore()
const landStore = useLandStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

const isSaving = ref(false)
let landSnapshot: Land | null = null
let themeSnapshot: LandTheme | null = null

async function save() {
  const land = landStore.activeLand
  if (!land) return
  isSaving.value = true
  try {
    await landService.save(land.id, {
      sections: land.sections,
      theme: themeStore.theme ?? land.theme,
    })
    editorStore.markClean()
    // Update snapshot to reflect the newly saved state
    landSnapshot = JSON.parse(JSON.stringify(landStore.activeLand))
    themeSnapshot = themeStore.theme ? JSON.parse(JSON.stringify(themeStore.theme)) : null
  } finally {
    isSaving.value = false
  }
}

watch(() => route.path, () => {
  activeModal.value = null
})

router.beforeEach((to, from) => {
  if (project.mode === 'editor' && to.path !== from.path) {
    if (editorStore.isDirty) {
      pendingPath.value = to.path
      leaveContext.value = 'navigate'
      showLeaveModal.value = true
      return false
    }
    exitEditor()
  }
})

function enterEditor() {
  activeModal.value = null
  // Snapshot current state before any edits
  landSnapshot = JSON.parse(JSON.stringify(landStore.activeLand))
  themeSnapshot = themeStore.theme ? JSON.parse(JSON.stringify(themeStore.theme)) : null
  project.setMode('editor')
  editorStore.enterEditMode()
}

function exitEditor() {
  project.setMode('preview')
  editorStore.exitEditMode()
  landSnapshot = null
  themeSnapshot = null
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
  if (land && landSnapshot) {
    landStore.updateLand(land.id, landSnapshot)
  }
  if (themeSnapshot) {
    themeStore.setTheme(themeSnapshot)
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
  await save()
  showPublishedModal.value = true
}

function confirmPublished() {
  showPublishedModal.value = false
  exitEditor()
}
</script>

<template>
    <header class="flex justify-between items-center p-2">

        <BaseMenu />


        <Transition name="modal-title" mode="out-in">

          <!--Preview state-->
          <div v-if="project.mode === 'preview' && route.path === '/dashboard'" class="flex space-x-2 items-center">
              <BaseButton size="sm" variant="outline" :active="activeModal === 'plugins'" @click="activeModal = activeModal === 'plugins' ? null : 'plugins'">
                  <PuzzlePieceIcon class="h-4 w-4" />
                  Plugins
              </BaseButton>
              <BaseButton size="sm" variant="outline" :active="activeModal === 'settings'" @click="activeModal = activeModal === 'settings' ? null : 'settings'">
                  <Cog6ToothIcon class="h-4 w-4" />
                  Settings
              </BaseButton>
              <BaseButton size="sm" variant="solid" @click="enterEditor">
                  <PencilSquareIcon class="h-4 w-4" />
                  Edit
              </BaseButton>
          </div>

          <!--Editor state-->
          <div v-else-if="project.mode === 'editor'" class="flex space-x-2 items-center">
              <BaseButton size="sm">
                  <LinkIcon class="h-4 w-4" />
                  {{ landStore.activeLand?.handle }}.lands.app
              </BaseButton>
              <BaseButton size="sm" variant="outline" @click="handleClose">
                  Close
              </BaseButton>
              <BaseButton size="sm" variant="outline" :disabled="isSaving" @click="save">
                  {{ isSaving ? 'Saving…' : 'Save' }}
              </BaseButton>
              <BaseButton size="sm" variant="solid" :disabled="isSaving" @click="publish">
                  <CloudArrowUpIcon class="h-4 w-4" />
                  {{ isSaving ? 'Publishing…' : 'Publish' }}
              </BaseButton>
          </div>

        </Transition>

        <Transition name="modal-grow">
          <PluginsModal v-if="activeModal === 'plugins'" @close="activeModal = null" />
        </Transition>
        <Transition name="modal-grow">
          <SettingsModal v-if="activeModal === 'settings'" @close="activeModal = null" />
        </Transition>
        <Transition name="modal-grow">
          <EditorModal v-if="project.mode === 'editor'" @close="project.setMode('preview')" />
        </Transition>
        <Transition name="modal-center">
          <ConfirmLeaveModal v-if="showLeaveModal" @confirm="confirmLeave" @cancel="cancelLeave" />
        </Transition>
        <Transition name="modal-center">
          <ConfirmPublishedModal v-if="showPublishedModal" @close="confirmPublished" />
        </Transition>


        
    </header>
</template>