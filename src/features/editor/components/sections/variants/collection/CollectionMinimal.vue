<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/shared/lib/position'
import type { Section } from '@/features/sections/types'
import type { Collection } from '@/features/sections/types/collection'

const props = defineProps<{ section: Section }>()
const collections = computed<Collection[]>(() => sortByPosition((props.section.content as any)?.collections ?? []))
const variant = computed(() => props.section.style_variant)

function smartColumns(count: number): number {
  if (count <= 0) return 2
  if (count <= 4) return count
  const score = (cols: number) => count % cols === 0 ? cols : count % cols
  return [4, 3, 2].reduce((a, b) => score(a) >= score(b) ? a : b)
}

const gridClass = computed(() => {
  const cols = smartColumns(collections.value.flatMap(c => c.items).length)
  return `grid grid-cols-${cols} gap-8`
})
</script>

<template>
  <div v-for="col in collections" :key="col.id" class="flex flex-col mx-auto px-8 py-32 gap-16">
    <div class="flex flex-col gap-4">
      <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">{{ col.title }}</h2>
      <p v-if="col.description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ col.description }}</p>
    </div>

    <ul :class="gridClass">
      <li
        v-for="item in sortByPosition(col.items)"
        :key="item.id"
        class="flex flex-col gap-8"
        style="border-color: var(--theme-main)"
      >
        <div
          class="overflow-hidden rounded-md"
          :class="variant === 'cards' ? 'aspect-video' : 'flex-1 aspect-square'"
          style="background: var(--theme-main)"
        >
          <img v-if="item.media_url" :src="item.media_url" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="text-2xl font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p v-if="item.subtitle" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.subtitle }}</p>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="collections.length === 0" class="text-sm text-gray-400 px-6 py-4">No collections yet</p>
</template>
