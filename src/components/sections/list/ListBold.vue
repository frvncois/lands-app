<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { ListItem } from '@/types/list'

const props = defineProps<{ section: Section }>()
const items = computed(() => sortByPosition((props.section.content as any)?.items ?? [] as ListItem[]))
const title = computed(() => (props.section.content as any)?.title ?? '')
</script>

<template>
  <div class="p-10">
  <h2 v-if="title" class="text-xs font-semibold uppercase tracking-widest mb-8 opacity-40" style="color: var(--theme-main)">{{ title }}</h2>
  <ul class="grid grid-cols-3 gap-16">
    <li
      v-for="item in items"
      :key="item.id"
      class="overflow-hidden rounded-4xl"
      style="background: var(--theme-surface)"
    >
      <a :href="item.url" target="_blank" class="p-16 flex flex-col flex-1 gap-16 h-full group">
        <h1 class="text-6xl font-bold leading-none tracking-tight transition-opacity group-hover:opacity-60" style="color: var(--theme-main)">
          {{ item.title }}
        </h1>
        <p v-if="item.description" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.description }}</p>
      </a>
    </li>
    <p v-if="items.length === 0" class="text-sm text-gray-400 col-span-3">No links yet</p>
  </ul>
  </div>
</template>
