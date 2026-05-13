<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseToggle from '@/shared/ui/BaseToggle.vue'
import type { ContentMediaSection, ContentMediaButton } from '@/features/sections/types'
import { useEditorMutations } from '@/features/editor/composables/useEditorMutations'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'
import { useThemePreset } from '@/features/theme/composables/useThemePreset'

const props = defineProps<{ section: ContentMediaSection }>()

const { isStructureTheme } = useThemePreset()
const { updateSectionContent, updateSectionStyleVariant } = useEditorMutations()
const { contentField } = useSectionForm(() => props.section)

const mediaType = contentField<'image' | 'video'>('media_type', 'image')
const mediaUrl = contentField('media_url', '')
const title = contentField('title', '')
const subtitle = contentField('subtitle', '')
const body = contentField('body', '')
const cmButtons = ref<ContentMediaButton[]>([])

function syncButtons() {
  cmButtons.value = JSON.parse(JSON.stringify(props.section.content?.buttons ?? []))
}
syncButtons()
watch(() => props.section.id, syncButtons)

function save() {
  updateSectionContent(props.section.id, { buttons: cmButtons.value })
}

function addButton() {
  if (cmButtons.value.length >= 6) return
  cmButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  save()
}

function removeButton(id: string) {
  cmButtons.value = cmButtons.value.filter((b) => b.id !== id)
  save()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <div class="flex flex-col gap-2">
      <p class="text-xs font-medium text-gray-500">Media</p>
      <div class="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit text-xs">
        <button
          class="px-3 py-1 rounded-md transition-colors"
          :class="mediaType === 'image' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'"
          @click="mediaType = 'image'"
        >Image</button>
        <button
          class="px-3 py-1 rounded-md transition-colors"
          :class="mediaType === 'video' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'"
          @click="mediaType = 'video'"
        >Video</button>
      </div>
      <BaseUpload v-if="mediaType === 'image'" type="image" size="sm" label="" v-model="mediaUrl" />
      <BaseInput v-else size="sm" label="" v-model="mediaUrl" placeholder="YouTube, Vimeo, or direct video URL…" />
    </div>
    <BaseInput size="sm" label="Title" v-model="title" placeholder="Your headline" />
    <BaseInput size="sm" label="Subtitle" v-model="subtitle" placeholder="Eyebrow text" />
    <BaseInput size="sm" type="textarea" label="Body" v-model="body" placeholder="Supporting text" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between">
        <p class="text-xs font-medium text-gray-500">Links</p>
        <BaseButton v-if="cmButtons.length < 6" variant="outline" size="xs" @click="addButton">
          <PlusIcon class="h-3 w-3" /> Add link
        </BaseButton>
      </div>
      <div class="flex flex-col gap-2">
        <p v-if="!cmButtons.length" class="text-xs text-gray-400">No links added</p>
        <div v-for="btn in cmButtons" :key="btn.id" class="flex items-center gap-1">
          <BaseInput size="sm" label="" v-model="btn.label" placeholder="Label" class="flex-1" @update:modelValue="save" />
          <BaseInput size="sm" label="" v-model="btn.url" placeholder="https://..." class="flex-1" @update:modelValue="save" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeButton(btn.id)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
    <BaseToggle
      v-if="isStructureTheme"
      label="Invert layout"
      :modelValue="section.style_variant === 'reversed'"
      @update:modelValue="updateSectionStyleVariant(section.id, $event ? 'reversed' : 'default')"
    />
  </div>
</template>
