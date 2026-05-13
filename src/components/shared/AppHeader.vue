<script setup lang="ts">
import { ref, watch } from 'vue'
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
import IntegrationsModal from '../modals/IntegrationsModal.vue';
import CustomDomainModal from '../modals/CustomDomainModal.vue';
import ConfirmLeaveModal from '../modals/ConfirmLeaveModal.vue';
import ConfirmPublishedModal from '../modals/ConfirmPublishedModal.vue';
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { usePublishFlow } from '@/composables/usePublishFlow'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()
const landStore = useLandStore()
const appModals = useAppModals()
const showCustomDomainModal = ref(false)
const {
  isSaving, isPublishing, publishStatus,
  showLeaveModal, showPublishedModal, showUpToDate, canPublish,
  save, publish, enterEditor, handleClose,
  confirmLeave, cancelLeave, confirmPublished, showUpToDateHint,
} = usePublishFlow()

watch(() => route.path, () => { appModals.close() })

async function handleLogout() {
  await authService.logout()
  router.push('/auth')
}

function openSupport() {
  window.open('mailto:support@lands.app', '_blank')
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
                  Tools
              </BaseButton>
              <BaseButton size="sm" variant="solid" @click="enterEditor">
                  <PencilSquareIcon class="h-4 w-4" />
                  Edit
              </BaseButton>
          </div>

          <!--Account state-->
          <div v-else-if="route.path.startsWith('/dashboard/account') || route.path.startsWith('/dashboard/plans')" class="flex space-x-2 items-center">
              <BaseButton size="sm" variant="outline" @click="openSupport">
                  <QuestionMarkCircleIcon class="h-4 w-4" />
                  Need help?
              </BaseButton>
          </div>

          <!--Editor state-->
          <div v-else-if="editorStore.isEditMode" class="flex">
              <div class="flex justify-end gap-2">
              <BaseButton size="sm" variant="ghost" class="hidden lg:flex text-gray-400 bg-gray-50">
                  <LinkIcon class="h-3.5 w-3.5" />
                  {{ landStore.activeLand?.handle }}.lands.app
              </BaseButton>
                <BaseButton size="sm" variant="ghost" @click="handleClose">
                    Close Editor
                </BaseButton>
                <BaseButton size="sm" variant="outline" :disabled="isSaving" @click="save">
                    {{ isSaving ? 'Saving…' : 'Save' }}
                </BaseButton>
                <div class="relative">
                  <BaseButton size="sm" variant="solid" :class="canPublish ? 'bg-indigo-600' : 'bg-gray-900'" @click="canPublish ? publish() : showUpToDateHint()">
                    <CloudArrowUpIcon class="h-4 w-4" />
                    {{ isPublishing ? 'Publishing…' : 'Publish' }}
                  </BaseButton>
                  <Transition name="hint-fade">
                    <div v-if="showUpToDate" class="absolute top-full right-0 mt-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
                      Already up to date
                    </div>
                  </Transition>
                </div>
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
          <IntegrationsModal v-if="appModals.activeModal === 'integrations'" @close="appModals.close()" @open-custom-domain="appModals.close(); showCustomDomainModal = true" />
        </Transition>

        <Transition name="modal-center">
          <CustomDomainModal v-if="showCustomDomainModal" @close="showCustomDomainModal = false" />
        </Transition>

        <Transition name="modal-center">
          <ConfirmLeaveModal v-if="showLeaveModal" @confirm="confirmLeave" @cancel="cancelLeave" />
        </Transition>
        <Transition name="modal-center">
          <ConfirmPublishedModal v-if="showPublishedModal" :handle="landStore.activeLand?.handle ?? ''" :status="publishStatus" @close="confirmPublished" />
        </Transition>



    </header>


</template>

<style scoped>
.hint-fade-enter-active, .hint-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.hint-fade-enter-from, .hint-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
