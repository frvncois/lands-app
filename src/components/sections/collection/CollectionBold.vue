<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { Collection } from '@/types/collection'

const props = defineProps<{ section: Section }>()
const collections = computed(() => sortByPosition((props.section.content as any)?.collections ?? [] as Collection[]))
</script>

<template>
  <div v-for="col in collections" :key="col.id" class="px-10 py-12 space-y-12">
    <h2 class="text-4xl font-bold" style="color: var(--theme-main)">{{ col.title }}</h2>
    <ul class="grid grid-cols-3 gap-16">
      <li v-for="item in sortByPosition(col.items)" :key="item.id" class="flex flex-col gap-2">
        <div class="flex-1 aspect-square overflow-hidden rounded-4xl" style="background: var(--theme-surface)">
          <img v-if="item.media_url" :src="item.media_url" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="text-2xl font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.description }}</p>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="collections.length === 0" class="text-sm text-gray-400 px-10 py-4">No collections yet</p>
</template>
