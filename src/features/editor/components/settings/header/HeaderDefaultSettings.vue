<script setup lang="ts">
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import type { HeaderSection } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: HeaderSection }>()

const { contentField, settingsField } = useSectionForm(() => props.section)

const headerTitle = contentField('title', '')
const headerSubtitle = contentField('subtitle', '')
const headerLogoUrl = contentField('logo', '')
const headerCoverMediaValue = settingsField('cover_media_value', '')
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" />
    <BaseUpload type="image" size="sm" label="Cover image" v-model="headerCoverMediaValue" />
    <BaseInput size="sm" label="Title" v-model="headerTitle" />
    <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" />
  </div>
</template>
