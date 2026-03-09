<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section, MediaContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const items = computed(() => sortByPosition((props.section.content as MediaContent | null)?.items ?? []))
</script>

<template>
  <div class="px-6 py-4 grid grid-cols-2 gap-2">
    <div v-for="item in items" :key="item.id" class="aspect-video rounded-lg overflow-hidden bg-gray-100">
      <img v-if="item.media_type === 'image'" :src="item.url" class="w-full h-full object-cover" />
      <div v-else class="flex items-center justify-center h-full text-xs text-gray-400">Video</div>
    </div>
  </div>
</template>
