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
  <div class="px-6 py-6 flex flex-col gap-0">
  <h2 v-if="title" class="text-xs font-semibold uppercase tracking-widest mb-6 opacity-40" style="color: var(--theme-main)">{{ title }}</h2>
    <a
      v-for="(item, i) in items"
      :key="item.id"
      :href="item.url"
      target="_blank"
      class="flex items-baseline gap-4 py-4 border-b border-gray-100 last:border-0 group"
    >
      <span class="text-xs text-gray-300 w-5 shrink-0 font-mono">{{ String(i + 1).padStart(2, '0') }}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate" style="color: var(--theme-main)">{{ item.title }}</p>
        <p v-if="item.description" class="text-xs text-gray-400 truncate mt-0.5">{{ item.description }}</p>
      </div>
      <span class="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--theme-accent)">↗</span>
    </a>
    <p v-if="items.length === 0" class="text-sm text-gray-400 py-3">No links yet</p>
  </div>
</template>
