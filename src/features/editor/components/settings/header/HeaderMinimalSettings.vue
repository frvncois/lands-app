<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseLinkPicker from '@/shared/ui/BaseLinkPicker.vue'
import BaseSwitch from '@/shared/ui/BaseSwitch.vue'
import type { HeaderSection, ContentMediaButton } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: HeaderSection }>()

const { contentField, settingsField, patchContent } = useSectionForm(() => props.section)

const headerTitle = contentField('title', '')
const headerDescription = contentField('description', '')
const headerLogoUrl = contentField('logo', '')
const headerCoverMediaType = settingsField<'image' | 'video'>('cover_media_type', 'image')
const headerCoverMediaValue = settingsField('cover_media_value', '')
const headerButtons = ref<ContentMediaButton[]>([])

function syncButtons() {
  headerButtons.value = JSON.parse(JSON.stringify(props.section.content?.buttons ?? []))
}
syncButtons()
watch(() => props.section.id, syncButtons)

function saveButtons() {
  patchContent({ buttons: headerButtons.value })
}

function addLink() {
  if (headerButtons.value.length >= 5) return
  headerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveButtons()
}

function removeLink(id: string) {
  headerButtons.value = headerButtons.value.filter((b) => b.id !== id)
  saveButtons()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" />
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-gray-500">Cover</p>
        <BaseSwitch
          :options="[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]"
          v-model="headerCoverMediaType"
        />
      </div>
      <BaseUpload v-if="headerCoverMediaType === 'image'" type="image" size="sm" label="" v-model="headerCoverMediaValue" />
      <BaseInput v-else size="sm" label="" v-model="headerCoverMediaValue" placeholder="https://…" />
    </div>
    <BaseInput size="sm" label="Title" v-model="headerTitle" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Links</p>
        <BaseButton v-if="headerButtons.length < 5" variant="outline" size="xs" @click="addLink">
          <PlusIcon class="h-3 w-3" /> Add link
        </BaseButton>
      </div>
      <p v-if="!headerButtons.length" class="text-xs text-gray-400">No links added</p>
      <div v-for="btn in headerButtons" :key="btn.id" class="flex items-center gap-3">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveButtons" @update:url="saveButtons" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
