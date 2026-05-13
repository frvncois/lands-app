<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../ui/BaseInput.vue'
import BaseUpload from '../../ui/BaseUpload.vue'
import BaseButton from '../../ui/BaseButton.vue'
import BaseToggle from '../../ui/BaseToggle.vue'
import type { Section, ContentMediaContent, ContentMediaButton } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'
import { useThemePreset } from '@/composables/useThemePreset'

const props = defineProps<{ section: Section }>()

const { isStructureTheme } = useThemePreset()

const { updateSectionContent, updateSectionStyleVariant } = useEditorActions()

const cmMediaType = ref<'image' | 'video'>('image')
const cmMediaUrl = ref('')
const cmTitle = ref('')
const cmSubtitle = ref('')
const cmBody = ref('')
const cmButtons = ref<ContentMediaButton[]>([])

function sync() {
  const c = props.section.content as ContentMediaContent | null
  cmMediaType.value = c?.media_type ?? 'image'
  cmMediaUrl.value = c?.media_url ?? ''
  cmTitle.value = c?.title ?? ''
  cmSubtitle.value = c?.subtitle ?? ''
  cmBody.value = c?.body ?? ''
  cmButtons.value = c?.buttons ? JSON.parse(JSON.stringify(c.buttons)) : []
}

sync()
watch(() => props.section.id, sync)

function save() {
  updateSectionContent(props.section.id, {
    media_type: cmMediaType.value,
    media_url: cmMediaUrl.value,
    title: cmTitle.value,
    subtitle: cmSubtitle.value,
    body: cmBody.value,
    buttons: cmButtons.value,
  })
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
          :class="cmMediaType === 'image' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'"
          @click="cmMediaType = 'image'; save()"
        >Image</button>
        <button
          class="px-3 py-1 rounded-md transition-colors"
          :class="cmMediaType === 'video' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'"
          @click="cmMediaType = 'video'; save()"
        >Video</button>
      </div>
      <BaseUpload v-if="cmMediaType === 'image'" type="image" size="sm" label="" v-model="cmMediaUrl" @update:modelValue="save" />
      <BaseInput v-else size="sm" label="" v-model="cmMediaUrl" placeholder="YouTube, Vimeo, or direct video URL…" @update:modelValue="save" />
    </div>
    <BaseInput size="sm" label="Title" v-model="cmTitle" placeholder="Your headline" @update:modelValue="save" />
    <BaseInput size="sm" label="Subtitle" v-model="cmSubtitle" placeholder="Eyebrow text" @update:modelValue="save" />
    <BaseInput size="sm" type="textarea" label="Body" v-model="cmBody" placeholder="Supporting text" @update:modelValue="save" />
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
