<script setup lang="ts">
import { ref, computed } from 'vue'
import { LUCIDE_ICONS } from '@/lib/utils/lucideIcons'
import BaseUpload from './BaseUpload.vue'

const props = defineProps<{
  iconType: 'image' | 'lucide' | 'none'
  iconName: string
  imageUrl: string
}>()

const emit = defineEmits<{
  'update:iconType': [value: 'image' | 'lucide' | 'none']
  'update:iconName': [value: string]
  'update:imageUrl': [value: string]
}>()

const query = ref('')
const filtered = computed(() =>
  query.value.trim()
    ? LUCIDE_ICONS.filter(i => i.label.toLowerCase().includes(query.value.toLowerCase()) || i.name.toLowerCase().includes(query.value.toLowerCase()))
    : LUCIDE_ICONS
)

const groups = computed(() => {
  const map: Record<string, typeof LUCIDE_ICONS> = {}
  for (const icon of filtered.value) {
    ;(map[icon.group] ??= []).push(icon)
  }
  return map
})

function selectMode(mode: 'image' | 'lucide' | 'none') {
  emit('update:iconType', mode)
}

function selectIcon(name: string) {
  emit('update:iconName', name)
  emit('update:iconType', 'lucide')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-gray-500">Icon / Image</span>

      <!-- Mode tabs -->
      <div class="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium">
        <button
          v-for="mode in (['none', 'lucide', 'image'] as const)"
          :key="mode"
          class="flex-1 py-1.5 capitalize transition-colors border-r border-gray-200 last:border-r-0"
          :class="iconType === mode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
          @click="selectMode(mode)"
        >{{ mode === 'lucide' ? 'Icon' : mode === 'image' ? 'Image' : 'None' }}</button>
      </div>
    </div>

    <!-- Image upload -->
    <template v-if="iconType === 'image'">
      <BaseUpload type="image" size="sm" :model-value="imageUrl" @update:modelValue="emit('update:imageUrl', $event)" />
    </template>

    <!-- Lucide icon picker -->
    <template v-else-if="iconType === 'lucide'">
      <!-- Search -->
      <input
        v-model="query"
        type="text"
        placeholder="Search icons…"
        class="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
      />

      <!-- Grid -->
      <div class="max-h-48 overflow-y-auto flex flex-col gap-3 pr-1">
        <div v-for="(icons, group) in groups" :key="group" class="flex flex-col gap-1.5">
          <p class="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{{ group }}</p>
          <div class="grid grid-cols-6 gap-1">
            <button
              v-for="icon in icons"
              :key="icon.name"
              :title="icon.label"
              class="flex items-center justify-center h-9 w-full rounded-lg transition-colors"
              :class="iconName === icon.name ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
              @click="selectIcon(icon.name)"
            >
              <component :is="icon.component" :size="16" />
            </button>
          </div>
        </div>
        <p v-if="filtered.length === 0" class="text-xs text-gray-400 text-center py-4">No icons found</p>
      </div>
    </template>
  </div>
</template>
