<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import { useCollectionActions } from '@/features/editor/composables/useCollectionActions'
import type { CollectionItem, ConcertItemSettings, ItemLink } from '@/features/sections/types/collection'

const props = defineProps<{
  item: CollectionItem
  sectionId: string
  collectionId: string
}>()

defineExpose({ save })

const { updateCollectionItem } = useCollectionActions()

const mediaUrl = ref('')
const title = ref('')
const date = ref('')
const hour = ref('')
const price = ref('')
const venue = ref('')
const city = ref('')
const country = ref('')
const details = ref('')
const links = ref<ItemLink[]>([])
const ticketLabel = ref('')
const ticketUrl = ref('')

watch(() => props.item, (item) => {
  mediaUrl.value = item.media_url
  title.value = item.title
  details.value = item.description
  const s = (item.settings_json ?? {}) as ConcertItemSettings
  date.value = s.date ?? ''
  hour.value = s.hour ?? ''
  price.value = s.price ?? ''
  venue.value = s.venue ?? ''
  city.value = s.city ?? ''
  country.value = s.country ?? ''
  links.value = s.links ? JSON.parse(JSON.stringify(s.links)) : []
  ticketLabel.value = s.ticket_label ?? ''
  ticketUrl.value = s.ticket_url ?? ''
}, { immediate: true })

function addLink() { links.value.push({ id: crypto.randomUUID(), title: '', url: '' }) }
function removeLink(i: number) { links.value.splice(i, 1) }

function save() {
  const settings: ConcertItemSettings = {
    date: date.value,
    hour: hour.value,
    price: price.value,
    venue: venue.value,
    city: city.value,
    country: country.value,
    links: links.value,
    ticket_label: ticketLabel.value,
    ticket_url: ticketUrl.value,
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
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <BaseInput size="sm" label="Title" v-model="title" />

      <div class="grid grid-cols-2 gap-3">
        <BaseInput size="sm" label="Date" v-model="date" placeholder="2024-09-15" />
        <BaseInput size="sm" label="Time" v-model="hour" placeholder="8:00 PM" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput size="sm" label="Price" v-model="price" placeholder="$25 / Free" />
        <BaseInput size="sm" label="Venue" v-model="venue" placeholder="The Venue" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput size="sm" label="City" v-model="city" placeholder="New York" />
        <BaseInput size="sm" label="Country" v-model="country" placeholder="USA" />
      </div>

      <BaseInput size="sm" type="textarea" label="Details" v-model="details" placeholder="Additional info…" />

      <!-- Links -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Links</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addLink">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(link, i) in links" :key="link.id" class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="link.title" placeholder="Label" class="flex-1" />
          <BaseInput size="sm" label="" v-model="link.url" placeholder="https://…" class="flex-1" />
          <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(i)">
            <TrashIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="!links.length" class="text-xs text-gray-400">No links added</p>
      </div>

      <!-- Ticket link -->
      <div class="space-y-2">
        <p class="text-xs font-medium text-gray-500">Ticket link</p>
        <div class="flex items-center gap-2">
          <BaseInput size="sm" label="" v-model="ticketLabel" placeholder="Get tickets" class="flex-1" />
          <BaseInput size="sm" label="" v-model="ticketUrl" placeholder="https://…" class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>
