<script setup lang="ts">
import { computed } from 'vue'
import type { Section } from '@/features/sections/types'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'campaign' ? props.section.content : null)
</script>

<template>
  <div class="flex flex-1 flex-col gap-8 items-center py-36 px-6" style="border-color: var(--theme-main)">
    <h1 class="text-8xl font-bold leading-none tracking-tight" style="color: var(--theme-main)">{{ c?.title }}</h1>
    <p v-if="c?.description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ c.description }}</p>
    <div class="flex items-center gap-2 shrink-0">
      <input
        type="email"
        :placeholder="c?.placeholder || 'email@example.com'"
        class="border bg-transparent outline-none text-sm p-4 rounded-xl h-14 w-96"
        style="border-color: var(--theme-main); color: var(--theme-main)"
      />
      <button
        class="py-4 px-8 text-sm font-medium rounded-xl transition-opacity disabled:opacity-50 text-gray-100 h-14"
        style="background: var(--theme-accent);">
        {{ c?.button_label || 'Subscribe' }}
      </button>
    </div>
  </div>
</template>
