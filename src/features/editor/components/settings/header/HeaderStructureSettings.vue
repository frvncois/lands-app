<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseLinkPicker from '@/shared/ui/BaseLinkPicker.vue'
import type { HeaderSection, ContentMediaButton } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: HeaderSection }>()

const { contentField, patchContent } = useSectionForm(() => props.section)

const headerTitle = contentField('title', '')
const headerSubtitle = contentField('subtitle', '')
const headerDescription = contentField('description', '')
const headerLogoUrl = contentField('logo', '')
const headerButtons = ref<ContentMediaButton[]>([])

function syncButtons() {
  headerButtons.value = JSON.parse(JSON.stringify(props.section.content?.buttons ?? []))
}
syncButtons()
watch(() => props.section.id, syncButtons)

function saveButtons() {
  patchContent({ buttons: headerButtons.value })
}

function addButton() {
  if (headerButtons.value.length >= 6) return
  headerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveButtons()
}

function removeButton(id: string) {
  headerButtons.value = headerButtons.value.filter((b) => b.id !== id)
  saveButtons()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" />
    <BaseInput size="sm" label="Title" v-model="headerTitle" />
    <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Buttons</p>
        <BaseButton v-if="headerButtons.length < 6" variant="outline" size="xs" @click="addButton">
          <PlusIcon class="h-3 w-3" /> Add button
        </BaseButton>
      </div>
      <p v-if="!headerButtons.length" class="text-xs text-gray-400">No buttons added</p>
      <div v-for="btn in headerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveButtons" @update:url="saveButtons" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeButton(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
