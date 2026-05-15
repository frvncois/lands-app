<script setup lang="ts">
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import type { HeaderSection } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: HeaderSection }>()

const { contentField } = useSectionForm(() => props.section)

const headerTitle = contentField('title', '')
const headerSubtitle = contentField('subtitle', '')
const headerDescription = contentField('description', '')
const headerLogoUrl = contentField('logo', '')
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" />
    <BaseInput size="sm" label="Title" v-model="headerTitle" />
    <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" />
  </div>
</template>
