<script setup lang="ts">
import type { Section, CampaignContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as CampaignContent | null
const minimal = props.section.style_variant === 'minimal'
</script>

<template>
  <div v-if="minimal" class="px-6 py-6 flex justify-center">
    <div class="flex gap-2 max-w-sm w-full">wer
      <input
        type="email"
        :placeholder="c?.placeholder || 'email@example.com'"
        class="flex-1 border-b bg-transparent outline-none text-sm pb-1"
        style="border-color: var(--theme-main); color: var(--theme-main)"
      />
      <button class="text-sm font-medium pb-1 shrink-0" style="color: var(--theme-accent)">
        {{ c?.button_label || 'Subscribe' }}
      </button>
    </div>
  </div>
  <div v-else class="flex flex-1 gap-8 justify-between items-end border-y py-4 px-6" style="border-color: var(--theme-main)">
    <h1 class="text-6xl font-bold leading-none tracking-tight" style="color: var(--theme-main)">{{ c?.title }}</h1>
    <input
      type="email"
      :placeholder="c?.placeholder || 'email@example.com'"
      class="border-b bg-transparent outline-none text-sm pb-1 shrink-0"
      style="border-color: var(--theme-main); color: var(--theme-main)"
    />
  </div>
</template>
