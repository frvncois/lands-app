<script setup lang="ts">
import { ref, watch } from 'vue'
import { GlobeAltIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseToggle from '@/shared/ui/BaseToggle.vue'
import CustomDomainModal from '@/features/modals/modals/CustomDomainModal.vue'
import ConfirmUnpublishModal from '@/features/modals/modals/ConfirmUnpublishModal.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorStore } from '@/features/editor/stores/editor'
import { landService } from '@/features/lands/services/land.service'
import { usePlan } from '@/features/plan/composables/usePlan'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { isPaid } = usePlan()

const settingsTitle = ref(landStore.activeLand?.title ?? '')
const settingsUrl = ref(landStore.activeLand?.handle ?? '')
const showDomainModal = ref(false)
const showUnpublishModal = ref(false)
const isPrivate = ref(landStore.activeLand?.is_private ?? false)
const privatePassword = ref(landStore.activeLand?.private_password ?? '')

watch(() => landStore.activeLand?.id, () => {
  settingsTitle.value = landStore.activeLand?.title ?? ''
  settingsUrl.value = landStore.activeLand?.handle ?? ''
  isPrivate.value = landStore.activeLand?.is_private ?? false
  privatePassword.value = landStore.activeLand?.private_password ?? ''
})

function onSettingsChange() {
  const land = landStore.activeLand
  if (!land) return
  landStore.updateLand(land.id, { title: settingsTitle.value, handle: settingsUrl.value })
  editorStore.markDirty()
}

function handlePublishedToggle(val: boolean) {
  const land = landStore.activeLand
  if (!land) return
  if (!val && land.is_published) {
    showUnpublishModal.value = true
  } else if (val) {
    landStore.updateLand(land.id, { is_published: true })
    landService.updateLand(land.id, { is_published: true })
  }
}

async function confirmUnpublish() {
  const land = landStore.activeLand
  if (!land) return
  showUnpublishModal.value = false
  landStore.updateLand(land.id, { is_published: false })
  await landService.updateLand(land.id, { is_published: false })
}

async function handlePrivateToggle(val: boolean) {
  const land = landStore.activeLand
  if (!land) return
  isPrivate.value = val
  if (!val) {
    privatePassword.value = ''
    landStore.updateLand(land.id, { is_private: false, private_password: null })
    await landService.updateLand(land.id, { is_private: false, private_password: null })
  } else {
    landStore.updateLand(land.id, { is_private: true })
    await landService.updateLand(land.id, { is_private: true })
  }
}

async function savePrivatePassword() {
  const land = landStore.activeLand
  if (!land || !privatePassword.value) return
  landStore.updateLand(land.id, { private_password: privatePassword.value })
  await landService.updateLand(land.id, { private_password: privatePassword.value })
}
</script>

<template>
  <BaseCard :icon="Cog6ToothIcon" title="Publish Settings">
    <div class="flex flex-col gap-3">
      <BaseInput size="sm" label="Project title" v-model="settingsTitle" placeholder="My project" @update:modelValue="onSettingsChange" />
      <BaseInput size="sm" type="slug" label="URL" v-model="settingsUrl" placeholder="my-project" @update:modelValue="onSettingsChange" />
      <div class="border-t border-gray-100 pt-3 flex flex-col gap-3">
        <BaseToggle
          size="sm"
          label="Published"
          description="Accessible publicly"
          :model-value="landStore.activeLand?.is_published ?? false"
          @update:model-value="handlePublishedToggle"
        />
        <BaseToggle
          size="sm"
          label="Private"
          description="Protect with a password"
          :model-value="isPrivate"
          @update:model-value="handlePrivateToggle"
        >
          <BaseInput
            size="sm"
            type="password"
            label="Password"
            v-model="privatePassword"
            placeholder="Enter password"
            @blur="savePrivatePassword"
            @keydown.enter="savePrivatePassword"
          />
        </BaseToggle>
      </div>
    </div>
  </BaseCard>

  <BaseCard v-if="isPaid" :icon="GlobeAltIcon" title="Custom domain" description="Connect your own domain">
    <template #actions>
      <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="showDomainModal = true">Setup</BaseButton>
    </template>
  </BaseCard>

  <Teleport to="body">
    <Transition name="modal-center">
      <CustomDomainModal v-if="showDomainModal" @close="showDomainModal = false" />
    </Transition>
    <Transition name="modal-center">
      <ConfirmUnpublishModal v-if="showUnpublishModal" @confirm="confirmUnpublish" @cancel="showUnpublishModal = false" />
    </Transition>
  </Teleport>
</template>
