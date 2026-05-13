<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '../../../ui/BaseInput.vue'
import BaseUpload from '../../../ui/BaseUpload.vue'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ section: Section }>()

const { updateSectionContent, updateSectionSettings } = useEditorActions()

const headerTitle = ref('')
const headerSubtitle = ref('')
const headerLogoUrl = ref('')
const headerCoverMediaValue = ref('')

function sync() {
  const c = props.section.content as HeaderContent | null
  const s = props.section.settings_json as HeaderSettings
  headerTitle.value = c?.title ?? ''
  headerSubtitle.value = c?.subtitle ?? ''
  headerLogoUrl.value = c?.logo ?? ''
  headerCoverMediaValue.value = s?.cover_media_value ?? ''
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    title: headerTitle.value,
    subtitle: headerSubtitle.value,
    logo: headerLogoUrl.value,
  })
}

function saveSettings() {
  updateSectionSettings(props.section.id, { cover_media_value: headerCoverMediaValue.value })
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" @update:modelValue="saveContent" />
    <BaseUpload type="image" size="sm" label="Cover image" v-model="headerCoverMediaValue" @update:modelValue="saveSettings" />
    <BaseInput size="sm" label="Title" v-model="headerTitle" @update:modelValue="saveContent" />
    <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" @update:modelValue="saveContent" />
  </div>
</template>
