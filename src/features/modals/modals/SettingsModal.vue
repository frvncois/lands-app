<script setup lang="ts">
import { ref } from 'vue'
import { GlobeAltIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseItem from '@/shared/ui/BaseItem.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorMutations } from '@/features/editor/composables/useEditorMutations'
import CustomDomainModal from './CustomDomainModal.vue'
import DeleteProjectModal from './DeleteProjectModal.vue'

const emit = defineEmits<{ close: [] }>()

const landStore = useLandStore()
const { updateLandSettings } = useEditorMutations()

const title = ref(landStore.activeLand?.title ?? '')
const url = ref(landStore.activeLand?.handle ?? '')
const showDomainModal = ref(false)
const showDeleteModal = ref(false)

function save() {
  updateLandSettings({ title: title.value, handle: url.value })
}
</script>

<template>
  <div class="fixed top-20 right-8 w-80 z-50 bg-white shadow-xl rounded-2xl origin-top-right">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <Cog6ToothIcon class="h-4 w-4 text-gray-900" />
        <h2 class="text-sm font-semibold text-gray-900">Settings</h2>
      </div>
      <BaseButton variant="outline" size="xs" @click="$emit('close')">Close</BaseButton>
    </div>
    <div class="flex flex-col p-4 gap-4">
      <BaseInput size="sm" label="Project title" v-model="title" placeholder="My project" />
      <div class="space-y-2">
        <BaseInput size="sm" type="slug" label="URL" v-model="url" placeholder="my-project" />
        <BaseItem
          size="sm"
          :icon="GlobeAltIcon"
          :title="landStore.activeLand?.custom_domain ?? 'Custom domain'"
          :description="landStore.activeLand?.custom_domain_status === 'active' ? 'Connected ✓' : landStore.activeLand?.custom_domain_status === 'pending' ? 'Pending DNS…' : landStore.activeLand?.custom_domain_status === 'error' ? 'Connection error' : 'Connect your own domain'"
          :action="landStore.activeLand?.custom_domain ? 'Manage' : 'Setup'"
          @action="showDomainModal = true"
        />
      </div>
      <BaseButton variant="solid" @click="save">Save</BaseButton>
      <BaseButton variant="remove" @click="showDeleteModal = true">Delete project</BaseButton>
    </div>
    <Teleport to="body">
      <Transition name="modal-center">
        <CustomDomainModal v-if="showDomainModal" @close="showDomainModal = false" />
      </Transition>
      <Transition name="modal-center">
        <DeleteProjectModal v-if="showDeleteModal" @close="showDeleteModal = false" @deleted="emit('close')" />
      </Transition>
    </Teleport>
  </div>
</template>
