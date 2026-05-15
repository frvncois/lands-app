<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import { useCollectionActions } from '@/features/editor/composables/useCollectionActions'
import { useLandStore } from '@/features/lands/stores/land'
import type { CollectionItem, ReleaseItemSettings, BuyLink, ItemLink, Track } from '@/features/sections/types/collection'

const props = defineProps<{
  item: CollectionItem
  sectionId: string
  collectionId: string
}>()

defineExpose({ save })

const landStore = useLandStore()
const { updateCollectionItem } = useCollectionActions()

const mediaUrl = ref('')
const title = ref('')
const year = ref('')
const details = ref('')
const tracks = ref<Track[]>([])
const labels = ref<ItemLink[]>([])
const streamLinks = ref<ItemLink[]>([])
const buyLinks = ref<BuyLink[]>([])

watch(() => props.item, (item) => {
  mediaUrl.value = item.media_url
  title.value = item.title
  details.value = item.description
  const s = (item.settings_json ?? {}) as ReleaseItemSettings
  year.value = s.year ?? ''
  tracks.value = s.tracks ? JSON.parse(JSON.stringify(s.tracks)) : []
  labels.value = s.labels ? JSON.parse(JSON.stringify(s.labels)) : []
  streamLinks.value = s.stream_links ? JSON.parse(JSON.stringify(s.stream_links)) : []
  buyLinks.value = s.buy_links ? JSON.parse(JSON.stringify(s.buy_links)) : []
}, { immediate: true })

// ─── Tracks ───
function addTrack() { tracks.value.push({ id: crypto.randomUUID(), title: '', length: '' }) }
function removeTrack(i: number) { tracks.value.splice(i, 1) }

// ─── Links (labels / stream / buy) ───
function addLabel() { labels.value.push({ id: crypto.randomUUID(), title: '', url: '' }) }
function removeLabel(i: number) { labels.value.splice(i, 1) }
function addStream() { streamLinks.value.push({ id: crypto.randomUUID(), title: '', url: '' }) }
function removeStream(i: number) { streamLinks.value.splice(i, 1) }
function addBuyLink() { buyLinks.value.push({ id: crypto.randomUUID(), title: '', url: '', merch_item_id: undefined }) }
function removeBuyLink(i: number) { buyLinks.value.splice(i, 1) }

// ─── Buy now: merch item dropdown ───
const allStoreItems = ref<{ id: string; title: string }[]>([])
watch(() => landStore.activeLand, (land) => {
  if (!land) return
  const items: { id: string; title: string }[] = []
  for (const section of land.sections) {
    if (section.type === 'store') {
      for (const store of section.content?.stores ?? []) {
        for (const item of store.items) {
          items.push({ id: item.id, title: item.title })
        }
      }
    }
  }
  allStoreItems.value = items
}, { immediate: true })

const activeMerchDropdown = ref<number | null>(null)
function onBuyUrlFocus(i: number) { activeMerchDropdown.value = i }
function onBuyUrlBlur() { setTimeout(() => { activeMerchDropdown.value = null }, 150) }
function selectMerchItem(i: number, item: { id: string; title: string }) {
  const link = buyLinks.value[i]
  if (!link) return
  link.title = link.title || item.title
  link.url = ''
  link.merch_item_id = item.id
  activeMerchDropdown.value = null
}

function save() {
  const settings: ReleaseItemSettings = {
    year: year.value,
    tracks: tracks.value,
    labels: labels.value,
    stream_links: streamLinks.value,
    buy_links: buyLinks.value,
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
    <!-- Left: cover -->
    <div class="w-64 shrink-0 border-r border-gray-100 p-4 space-y-4 overflow-y-auto">
      <BaseUpload type="image" size="sm" label="Cover" v-model="mediaUrl" />
    </div>

    <!-- Right: fields -->
    <div class="flex-1 overflow-y-auto p-4 space-y-5">
      <!-- Title + Year -->
      <div class="grid grid-cols-3 gap-3">
        <BaseInput size="sm" label="Title" v-model="title" class="col-span-2" />
        <BaseInput size="sm" label="Year" v-model="year" placeholder="2024" />
      </div>

      <!-- Tracks -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Tracks</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addTrack">
            <PlusIcon class="h-3 w-3" /> Add track
          </button>
        </div>
        <div v-for="(track, i) in tracks" :key="track.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="track.title" placeholder="Track title" class="flex-1" />
          <BaseInput size="sm" label="" v-model="track.length" placeholder="3:42" class="w-20 shrink-0" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeTrack(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!tracks.length" class="text-xs text-gray-400">No tracks added</p>
      </div>

      <!-- Details -->
      <BaseInput size="sm" type="textarea" label="Details" v-model="details" placeholder="Notes, liner notes, description…" />

      <!-- Label -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Label</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addLabel">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(lbl, i) in labels" :key="lbl.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="lbl.title" placeholder="Label name" class="flex-1" />
          <BaseInput size="sm" label="" v-model="lbl.url" placeholder="https://…" class="flex-1" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLabel(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!labels.length" class="text-xs text-gray-400">No labels added</p>
      </div>

      <!-- Stream -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Stream</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addStream">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(link, i) in streamLinks" :key="link.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="link.title" placeholder="Spotify, Apple Music…" class="flex-1" />
          <BaseInput size="sm" label="" v-model="link.url" placeholder="https://…" class="flex-1" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeStream(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!streamLinks.length" class="text-xs text-gray-400">No streaming links added</p>
      </div>

      <!-- Buy now -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Buy now</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addBuyLink">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(link, i) in buyLinks" :key="link.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="link.title" placeholder="Bandcamp, iTunes…" class="flex-1" />
          <div class="relative flex-1">
            <input
              v-model="link.url"
              :placeholder="link.merch_item_id ? '← Merch item linked' : 'https://… or pick a product'"
              class="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400"
              @focus="onBuyUrlFocus(i)"
              @blur="onBuyUrlBlur"
              @input="link.merch_item_id = undefined"
            />
            <div
              v-if="activeMerchDropdown === i && allStoreItems.length"
              class="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            >
              <p class="px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-400">Your products</p>
              <button
                v-for="merch in allStoreItems"
                :key="merch.id"
                type="button"
                class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                @mousedown.prevent="selectMerchItem(i, merch)"
              >{{ merch.title }}</button>
            </div>
          </div>
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeBuyLink(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!buyLinks.length" class="text-xs text-gray-400">No buy links added</p>
      </div>
    </div>
  </div>
</template>
