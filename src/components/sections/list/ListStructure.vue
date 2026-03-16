<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { ListItem } from '@/types/list'

const props = defineProps<{ section: Section }>()
const items = computed<ListItem[]>(() => sortByPosition((props.section.content as any)?.items ?? []))
const title = computed(() => (props.section.content as any)?.title ?? '')
const compact = computed(() => props.section.style_variant === 'compact')
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h2 v-if="title" class="text-xs font-semibold uppercase tracking-widest mb-6 opacity-40" style="color: var(--theme-main)">{{ title }}</h2>
    <ul>
      <li v-for="item in items" :key="item.id" class="border-b" style="border-color: var(--theme-main); opacity-20">
        <a :href="item.url" target="_blank" :class="compact ? 'py-3 flex justify-between items-end gap-4 group' : 'py-8 flex justify-between items-end gap-8 group'">
          <h1
            :class="compact
              ? 'text-3xl font-semibold leading-tight tracking-tight transition-opacity group-hover:opacity-60'
              : 'text-8xl font-bold leading-none tracking-tight transition-opacity group-hover:opacity-60'"
            style="color: var(--theme-main)"
          >
            {{ item.title }}
          </h1>
        </a>
      </li>
      <p v-if="items.length === 0" class="text-sm text-gray-400 py-8">No links yet</p>
    </ul>
  </div>
</template>
