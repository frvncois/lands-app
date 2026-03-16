<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import { LUCIDE_ICON_MAP } from '@/lib/utils/lucideIcons'
import type { Section } from '@/types/section'
import type { ListItem } from '@/types/list'

const props = defineProps<{ section: Section }>()
const items = computed<ListItem[]>(() => sortByPosition((props.section.content as any)?.items ?? []))
const title = computed(() => (props.section.content as any)?.title ?? '')
const compact = computed(() => props.section.style_variant === 'compact')
</script>

<template>
  <div class="max-w-5xl py-16 mx-auto">
    <h2 v-if="title" class="text-4xl font-medium mb-8" style="color: var(--theme-main)">{{ title }}</h2>

    <div class="flex flex-col gap-2">
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.url || '#'"
        target="_blank"
        class="flex items-center gap-4 rounded-2xl transition-opacity hover:opacity-80"
        :class="compact ? 'p-4' : 'p-6'"
        style="background-color: color-mix(in srgb, var(--theme-accent) 10%, transparent)"
      >
        <!-- Icon / Image -->
        <div
          v-if="item.icon_type === 'lucide' && item.icon_name"
          class="shrink-0 flex items-center justify-center rounded-xl"
          :class="compact ? 'h-9 w-9' : 'h-12 w-12'"
          style="background-color: var(--theme-accent); color: white"
        >
          <component :is="LUCIDE_ICON_MAP[item.icon_name!]" :size="compact ? 16 : 20" />
        </div>

        <div
          v-else-if="item.icon_type === 'image' && item.icon"
          class="shrink-0 rounded-xl overflow-hidden bg-gray-100"
          :class="compact ? 'h-9 w-9' : 'h-12 w-12'"
        >
          <img :src="item.icon" class="w-full h-full object-cover" />
        </div>

        <!-- Text -->
        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
          <p
            class="font-medium leading-tight truncate"
            :class="compact ? 'text-sm' : 'text-base'"
            style="color: var(--theme-main)"
          >{{ item.title }}</p>
          <p
            v-if="item.subtitle"
            class="text-xs opacity-60 truncate"
            style="color: var(--theme-main)"
          >{{ item.subtitle }}</p>
        </div>
      </a>

      <p v-if="items.length === 0" class="text-sm text-gray-400 py-8">No links yet</p>
    </div>
  </div>
</template>
