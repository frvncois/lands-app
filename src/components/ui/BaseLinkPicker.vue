<script setup lang="ts">
import { ref, computed } from 'vue'
import { LinkIcon, HashtagIcon } from '@heroicons/vue/24/outline'
import { useLandStore } from '@/stores/land'
import { sortByPosition } from '@/lib/utils/position'
import { sectionPrimitives } from '@/sections/index'

const SECTION_PREFIX = '#section:'

const props = withDefaults(defineProps<{
  label: string
  url: string
  placeholder?: string
}>(), {
  placeholder: 'Label',
})

const emit = defineEmits<{
  'update:label': [value: string]
  'update:url': [value: string]
}>()

const landStore = useLandStore()
const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const sectionOptions = computed(() =>
  sortByPosition(landStore.activeLand?.sections ?? [])
    .filter(s => s.type !== 'header')
    .map(s => {
      const c = s.content as any
      let label: string
      if (s.type === 'collection' || s.type === 'monetize') label = c?.collections?.[0]?.title || sectionLabelMap[s.type] || s.type
      else if (s.type === 'store') label = c?.stores?.[0]?.title || sectionLabelMap[s.type] || s.type
      else label = c?.title || sectionLabelMap[s.type] || s.type
      return { id: s.id, label }
    })
)

const open = ref(false)
const customUrl = ref('')

function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    customUrl.value = props.url.startsWith(SECTION_PREFIX) ? '' : (props.url ?? '')
  }
}

function applyUrl() {
  const val = customUrl.value.trim()
  if (val) emit('update:url', val)
  open.value = false
}

function pickSection(id: string) {
  emit('update:url', SECTION_PREFIX + id)
  open.value = false
}

function clear() {
  emit('update:url', '')
  open.value = false
}
</script>

<template>
  <div class="relative flex-1">
    <!-- Merged input row -->
    <div class="flex items-center border border-gray-300 rounded-lg focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-900/5 transition-colors px-1.5">
      <input
        class="flex-1 min-w-0 text-xs py-1.5 bg-transparent text-gray-900 placeholder:text-gray-300 outline-none"
        :value="label"
        :placeholder="placeholder"
        @input="emit('update:label', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="shrink-0 p-0.5 rounded transition-colors"
        :class="url ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 hover:text-gray-500'"
        @click="toggleDropdown"
      >
        <LinkIcon class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
      <div class="p-2 border-b border-gray-100">
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-400">
          <input
            v-model="customUrl"
            type="text"
            placeholder="https://…"
            class="flex-1 min-w-0 text-xs px-2 py-1.5 focus:outline-none bg-white text-gray-900 placeholder:text-gray-300"
            @keydown.enter="applyUrl"
          />
          <button
            type="button"
            class="text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1.5 border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0"
            @click="applyUrl"
          >Apply</button>
        </div>
      </div>

      <div v-if="sectionOptions.length" class="max-h-40 overflow-y-auto">
        <button
          v-for="s in sectionOptions"
          :key="s.id"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
          :class="url === SECTION_PREFIX + s.id ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600'"
          @click="pickSection(s.id)"
        >
          <HashtagIcon class="h-3 w-3 shrink-0 text-gray-400" />
          {{ s.label }}
        </button>
      </div>
      <p v-else class="px-3 py-2 text-xs text-gray-400">No sections to link to</p>

      <div v-if="url" class="border-t border-gray-100 px-3 py-2">
        <button type="button" class="text-xs text-red-400 hover:text-red-600 transition-colors" @click="clear">
          Clear link
        </button>
      </div>
    </div>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </div>
</template>
