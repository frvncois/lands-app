<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../../ui/BaseInput.vue'
import BaseUpload from '../../../ui/BaseUpload.vue'
import BaseLinkPicker from '../../../ui/BaseLinkPicker.vue'
import type { FooterSection, ContentMediaButton } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ section: FooterSection }>()

const { updateSectionContent, updateSectionSettings } = useEditorActions()

const footerTitle = ref('')
const footerSubtitle = ref('')
const footerCoverMediaValue = ref('')
const footerButtons = ref<ContentMediaButton[]>([])

function sync() {
  const c = props.section.content
  const s = props.section.settings_json
  footerTitle.value = c?.title ?? ''
  footerSubtitle.value = c?.subtitle ?? ''
  footerCoverMediaValue.value = s?.cover_media_value ?? ''
  footerButtons.value = c?.buttons ? [...c.buttons] : []
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    title: footerTitle.value,
    subtitle: footerSubtitle.value,
    buttons: footerButtons.value,
  })
}

function saveSettings() {
  updateSectionSettings(props.section.id, { cover_media_value: footerCoverMediaValue.value })
}

function addLink() {
  if (footerButtons.value.length >= 6) return
  footerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveContent()
}

function removeLink(id: string) {
  footerButtons.value = footerButtons.value.filter((b) => b.id !== id)
  saveContent()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Cover image" v-model="footerCoverMediaValue" @update:modelValue="saveSettings" />
    <BaseInput size="sm" label="Title" v-model="footerTitle" @update:modelValue="saveContent" />
    <BaseInput size="sm" label="Subtitle" v-model="footerSubtitle" @update:modelValue="saveContent" />
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Links</span>
        <button v-if="footerButtons.length < 6" type="button" class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800" @click="addLink">
          <PlusIcon class="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div v-for="btn in footerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveContent" @update:url="saveContent" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
