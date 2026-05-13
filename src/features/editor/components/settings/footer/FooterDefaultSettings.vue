<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import BaseLinkPicker from '@/shared/ui/BaseLinkPicker.vue'
import type { FooterSection, ContentMediaButton } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: FooterSection }>()

const { contentField, settingsField, patchContent } = useSectionForm(() => props.section)

const footerTitle = contentField('title', '')
const footerSubtitle = contentField('subtitle', '')
const footerCoverMediaValue = settingsField('cover_media_value', '')
const footerButtons = ref<ContentMediaButton[]>([])

function syncButtons() {
  footerButtons.value = props.section.content?.buttons ? [...props.section.content.buttons] : []
}
syncButtons()
watch(() => props.section.id, syncButtons)

function saveButtons() {
  patchContent({ buttons: footerButtons.value })
}

function addLink() {
  if (footerButtons.value.length >= 6) return
  footerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveButtons()
}

function removeLink(id: string) {
  footerButtons.value = footerButtons.value.filter((b) => b.id !== id)
  saveButtons()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Cover image" v-model="footerCoverMediaValue" />
    <BaseInput size="sm" label="Title" v-model="footerTitle" />
    <BaseInput size="sm" label="Subtitle" v-model="footerSubtitle" />
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Links</span>
        <button v-if="footerButtons.length < 6" type="button" class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800" @click="addLink">
          <PlusIcon class="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div v-for="btn in footerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveButtons" @update:url="saveButtons" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
