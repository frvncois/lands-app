<script setup lang="ts">
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import BaseSwitch from '@/shared/ui/BaseSwitch.vue'
import type { HeaderSection } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: HeaderSection }>()

const { contentField, settingsField } = useSectionForm(() => props.section)

const headerTitle = contentField('title', '')
const headerDescription = contentField('description', '')
const headerLogoUrl = contentField('logo', '')
const headerCoverMediaType = settingsField<'image' | 'video'>('cover_media_type', 'image')
const headerCoverMediaValue = settingsField('cover_media_value', '')
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" />
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-gray-500">Cover</p>
        <BaseSwitch
          :options="[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]"
          v-model="headerCoverMediaType"
        />
      </div>
      <BaseUpload v-if="headerCoverMediaType === 'image'" type="image" size="sm" label="" v-model="headerCoverMediaValue" />
      <BaseInput v-else size="sm" label="" v-model="headerCoverMediaValue" placeholder="https://…" />
    </div>
    <BaseInput size="sm" label="Title" v-model="headerTitle" />
    <BaseInput size="sm" type="textarea" label="Description" v-model="headerDescription" placeholder="A short description…" />
  </div>
</template>
