<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../../ui/BaseInput.vue'
import BaseUpload from '../../../ui/BaseUpload.vue'
import BaseButton from '../../../ui/BaseButton.vue'
import BaseLinkPicker from '../../../ui/BaseLinkPicker.vue'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { Section, HeaderContent, HeaderSettings, ContentMediaButton } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ section: Section }>()

const { updateSectionContent, updateSectionSettings } = useEditorActions()

const headerTitle = ref('')
const headerDescription = ref('')
const headerLogoUrl = ref('')
const headerCoverMediaType = ref<'image' | 'video'>('image')
const headerCoverMediaValue = ref('')
const headerButtons = ref<ContentMediaButton[]>([])

function sync() {
  const c = props.section.content as HeaderContent | null
  const s = props.section.settings_json as HeaderSettings
  headerTitle.value = c?.title ?? ''
  headerDescription.value = c?.description ?? ''
  headerLogoUrl.value = c?.logo ?? ''
  headerCoverMediaType.value = s?.cover_media_type === 'video' ? 'video' : 'image'
  headerCoverMediaValue.value = s?.cover_media_value ?? ''
  headerButtons.value = c?.buttons ? JSON.parse(JSON.stringify(c.buttons)) : []
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    title: headerTitle.value,
    description: headerDescription.value,
    logo: headerLogoUrl.value,
    buttons: headerButtons.value,
  })
}

function saveSettings() {
  updateSectionSettings(props.section.id, {
    cover_media_type: headerCoverMediaType.value,
    cover_media_value: headerCoverMediaValue.value,
  })
}

function addLink() {
  if (headerButtons.value.length >= 5) return
  headerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveContent()
}

function removeLink(id: string) {
  headerButtons.value = headerButtons.value.filter((b) => b.id !== id)
  saveContent()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" @update:modelValue="saveContent" />
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-gray-500">Cover</p>
        <BaseSwitch
          :options="[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]"
          v-model="headerCoverMediaType"
          @update:modelValue="saveSettings"
        />
      </div>
      <BaseUpload v-if="headerCoverMediaType === 'image'" type="image" size="sm" label="" v-model="headerCoverMediaValue" @update:modelValue="saveSettings" />
      <BaseInput v-else size="sm" label="" v-model="headerCoverMediaValue" placeholder="https://…" @update:modelValue="saveSettings" />
    </div>
    <BaseInput size="sm" label="Title" v-model="headerTitle" @update:modelValue="saveContent" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" @update:modelValue="saveContent" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Links</p>
        <BaseButton v-if="headerButtons.length < 5" variant="outline" size="xs" @click="addLink">
          <PlusIcon class="h-3 w-3" /> Add link
        </BaseButton>
      </div>
      <p v-if="!headerButtons.length" class="text-xs text-gray-400">No links added</p>
      <div v-for="btn in headerButtons" :key="btn.id" class="flex items-center gap-3">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveContent" @update:url="saveContent" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
