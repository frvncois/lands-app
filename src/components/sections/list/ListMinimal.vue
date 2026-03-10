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
  <div class="max-w-5xl mx-auto">
  <h2 v-if="title" class="text-xs font-semibold uppercase tracking-widest mb-6 opacity-40" style="color: var(--theme-main)">{{ title }}</h2>
  <ul>
    <li v-for="item in items" :key="item.id" class="border-b" style="border-color: var(--theme-main); opacity-20">
      <a :href="item.url" target="_blank" class="py-8 flex justify-between items-end gap-8 group">
        <h1 class="text-8xl font-bold leading-none tracking-tight transition-opacity group-hover:opacity-60" style="color: var(--theme-main)">
          {{ item.title }}
        </h1>
        <p v-if="item.description" class="text-sm text-gray-400 shrink-0 pb-2">{{ item.description }}</p>
      </a>
    </li>
    <p v-if="items.length === 0" class="text-sm text-gray-400 py-8">No links yet</p>
  </ul>
  </div>
</template>
