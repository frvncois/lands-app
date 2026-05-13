<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../../ui/BaseInput.vue'
import BaseUpload from '../../../ui/BaseUpload.vue'
import BaseButton from '../../../ui/BaseButton.vue'
import BaseLinkPicker from '../../../ui/BaseLinkPicker.vue'
import type { Section, HeaderContent, ContentMediaButton } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ section: Section }>()

const { updateSectionContent } = useEditorActions()

const headerTitle = ref('')
const headerSubtitle = ref('')
const headerDescription = ref('')
const headerLogoUrl = ref('')
const headerButtons = ref<ContentMediaButton[]>([])

function sync() {
  const c = props.section.content as HeaderContent | null
  headerTitle.value = c?.title ?? ''
  headerSubtitle.value = c?.subtitle ?? ''
  headerDescription.value = c?.description ?? ''
  headerLogoUrl.value = c?.logo ?? ''
  headerButtons.value = c?.buttons ? JSON.parse(JSON.stringify(c.buttons)) : []
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    title: headerTitle.value,
    subtitle: headerSubtitle.value,
    description: headerDescription.value,
    logo: headerLogoUrl.value,
    buttons: headerButtons.value,
  })
}

function addButton() {
  if (headerButtons.value.length >= 6) return
  headerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveContent()
}

function removeButton(id: string) {
  headerButtons.value = headerButtons.value.filter((b) => b.id !== id)
  saveContent()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" @update:modelValue="saveContent" />
    <BaseInput size="sm" label="Title" v-model="headerTitle" @update:modelValue="saveContent" />
    <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" @update:modelValue="saveContent" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" @update:modelValue="saveContent" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Buttons</p>
        <BaseButton v-if="headerButtons.length < 6" variant="outline" size="xs" @click="addButton">
          <PlusIcon class="h-3 w-3" /> Add button
        </BaseButton>
      </div>
      <p v-if="!headerButtons.length" class="text-xs text-gray-400">No buttons added</p>
      <div v-for="btn in headerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveContent" @update:url="saveContent" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeButton(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
