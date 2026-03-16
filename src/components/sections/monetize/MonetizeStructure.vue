<script setup lang="ts">
import { computed } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import { useEditorStore } from '@/stores/editor'
import type { Section } from '@/types/section'
import type { Collection } from '@/types/collection'

const props = defineProps<{ section: Section }>()
const collections = computed<Collection[]>(() => sortByPosition((props.section.content as any)?.collections ?? []))
const editorStore = useEditorStore()
const isEditMode = computed(() => editorStore.isEditMode)

function priceLabel(col: Collection) {
  if (!col.price) return 'Free'
  const period = col.billing_period === 'yearly' ? 'year' : 'month'
  return `$${col.price} / ${period}`
}
</script>

<template>
  <div class="py-4 px-6">
    <div
      v-for="col in collections"
      :key="col.id"
      class="max-w-5xl mx-auto my-16 rounded-2xl overflow-hidden relative"
      style="min-height: 600px; background-color: color-mix(in srgb, var(--theme-accent) 50%, transparent)"
    >
      <!-- Cover image -->
      <img
        v-if="col.cover_url"
        :src="col.cover_url"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Accent gradient scrim (bottom 2/3) -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(to bottom, transparent 5%, color-mix(in srgb, var(--theme-accent) 95%, black 5%) 100%)"
      />

      <!-- Content bar — bottom -->
      <div class="absolute bottom-0 left-0 right-0 p-10 flex items-end justify-between gap-8">

        <!-- Left: text -->
        <div class="flex flex-col gap-1.5 min-w-0">
          <p v-if="col.subtitle" class="text-xs uppercase tracking-widest font-medium text-white opacity-70">{{ col.subtitle }}</p>
          <h2 class="text-3xl font-bold text-white leading-tight">{{ col.title || '[ Collection Name ]' }}</h2>
          <p v-if="col.description" class="text-sm text-white opacity-70 leading-relaxed max-w-md">{{ col.description }}</p>
          <p class="text-lg font-semibold text-white mt-1">{{ priceLabel(col) }}</p>
        </div>

        <!-- Right: CTA -->
        <button
          class="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
          :class="isEditMode ? 'opacity-50 cursor-default' : ''"
          style="background: white; color: var(--theme-accent)"
        >
          Access content
        </button>

      </div>
    </div>

    <p v-if="collections.length === 0" class="text-sm text-gray-400 px-6 py-4">No items yet</p>
  </div>
</template>
