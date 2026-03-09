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
import { useProjectStore } from '@/stores/project'
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'

const activeModal = ref<'plugins' | 'settings' | null>(null)
const showLeaveModal = ref(false)
const pendingPath = ref<string | null>(null)

const project = useProjectStore()
const editorStore = useEditorStore()
const landStore = useLandStore()
const route = useRoute()
const router = useRouter()

watch(() => route.path, () => {
  activeModal.value = null
})

router.beforeEach((to, from) => {
  if (project.mode === 'editor' && to.path !== from.path) {
    pendingPath.value = to.path
    showLeaveModal.value = true
    return false
  }
})

function enterEditor() {
  activeModal.value = null
  project.setMode('editor')
  editorStore.enterEditMode()
}

function exitEditor() {
  project.setMode('preview')
  editorStore.exitEditMode()
}

function confirmLeave() {
  exitEditor()
  showLeaveModal.value = false
  const path = pendingPath.value
  pendingPath.value = null
  if (path) router.push(path)
}

function cancelLeave() {
  showLeaveModal.value = false
  pendingPath.value = null
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
              <BaseButton size="sm" variant="outline" @click="exitEditor">
                  Cancel
              </BaseButton>
              <BaseButton size="sm" variant="solid" @click="exitEditor">
                  <CloudArrowUpIcon class="h-4 w-4" />
                  Publish
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


        
    </header>
</template>