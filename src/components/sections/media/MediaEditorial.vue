<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section, MediaContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const items = computed(() => sortByPosition((props.section.content as MediaContent | null)?.items ?? []))
</script>

<template>
  <div class="px-6 py-6 flex flex-col gap-6">
    <figure v-for="item in items" :key="item.id" class="flex flex-col gap-2">
      <div class="w-full overflow-hidden rounded-sm bg-gray-100">
        <img v-if="item.media_type === 'image'" :src="item.url" class="w-full object-cover" />
        <div v-else class="h-40 flex items-center justify-center text-xs text-gray-400">Video</div>
      </div>
      <figcaption v-if="item.caption" class="text-xs text-gray-400 italic">{{ item.caption }}</figcaption>
    </figure>
  </div>
</template>
