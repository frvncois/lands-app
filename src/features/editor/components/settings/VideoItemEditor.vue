<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import { useCollectionActions } from '@/features/editor/composables/useCollectionActions'
import type { CollectionItem, VideoItemSettings, ItemLink } from '@/features/sections/types/collection'

const props = defineProps<{
  item: CollectionItem
  sectionId: string
  collectionId: string
}>()

defineExpose({ save })

const { updateCollectionItem } = useCollectionActions()

const mediaUrl = ref('')
const title = ref('')
const year = ref('')
const videoUrl = ref('')
const details = ref('')
const credits = ref<ItemLink[]>([])

watch(() => props.item, (item) => {
  mediaUrl.value = item.media_url
  title.value = item.title
  details.value = item.description
  const s = (item.settings_json ?? {}) as VideoItemSettings
  year.value = s.year ?? ''
  videoUrl.value = s.video_url ?? ''
  credits.value = s.credits ? JSON.parse(JSON.stringify(s.credits)) : []
}, { immediate: true })

function addCredit() { credits.value.push({ id: crypto.randomUUID(), title: '', url: '' }) }
function removeCredit(i: number) { credits.value.splice(i, 1) }

function save() {
  const settings: VideoItemSettings = {
    year: year.value,
    video_url: videoUrl.value,
    credits: credits.value,
  }
  updateCollectionItem(props.sectionId, props.collectionId, props.item.id, {
    title: title.value,
    media_url: mediaUrl.value,
    description: details.value,
    settings_json: settings as Record<string, unknown>,
  })
}
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <!-- Left: cover + video link -->
    <div class="w-64 shrink-0 border-r border-gray-100 p-4 space-y-4 overflow-y-auto">
      <BaseUpload type="image" size="sm" label="Cover" v-model="mediaUrl" />
      <BaseInput size="sm" label="Video URL" v-model="videoUrl" placeholder="YouTube, Vimeo…" />
    </div>

    <!-- Right: fields -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="grid grid-cols-3 gap-3">
        <BaseInput size="sm" label="Title" v-model="title" class="col-span-2" />
        <BaseInput size="sm" label="Year" v-model="year" placeholder="2024" />
      </div>

      <BaseInput size="sm" type="textarea" label="Details" v-model="details" placeholder="Description, director, production notes…" />

      <!-- Credits -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Credits</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addCredit">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(credit, i) in credits" :key="credit.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="credit.title" placeholder="Director, DP…" class="flex-1" />
          <BaseInput size="sm" label="" v-model="credit.url" placeholder="https://…" class="flex-1" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeCredit(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!credits.length" class="text-xs text-gray-400">No credits added</p>
      </div>
    </div>
  </div>
</template>
