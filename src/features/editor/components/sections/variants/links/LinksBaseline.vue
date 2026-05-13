<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/shared/lib/position'
import type { Section } from '@/features/sections/types'
import type { ListItem } from '@/features/sections/types/links'

const props = defineProps<{ section: Section }>()
const items = computed<ListItem[]>(() => sortByPosition((props.section.content as any)?.items ?? []))
const title = computed(() => (props.section.content as any)?.title ?? '')
const description = computed(() => (props.section.content as any)?.description ?? '')
const compact = computed(() => props.section.style_variant === 'compact')
</script>

<template>
  <div class="flex flex-col mx-auto px-8 py-32 gap-16">
    <div v-if="title || description" class="flex flex-col gap-4">
      <h2 v-if="title" class="text-4xl font-semibold" style="color: var(--theme-main)">{{ title }}</h2>
      <p v-if="description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ description }}</p>
    </div>
    <ul>
      <li v-for="item in items" :key="item.id" class="border-b" style="border-color: var(--theme-main)">
        <a :href="item.url" target="_blank" :class="compact ? 'py-3 flex justify-between items-end gap-4 group' : 'py-8 flex justify-between items-end gap-8 group'">
          <h1
            :class="compact
              ? 'text-2xl font-semibold leading-tight tracking-tight'
              : 'text-8xl font-bold leading-none tracking-tight'"
            style="color: var(--theme-main)"
          >
            {{ item.title }}
          </h1>
          <p v-if="item.description" class="text-sm text-gray-400 shrink-0 pb-1">{{ item.description }}</p>
        </a>
      </li>
      <p v-if="items.length === 0" class="text-sm text-gray-400 py-8">No links yet</p>
    </ul>
  </div>
</template>
