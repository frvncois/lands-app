<script setup lang="ts">
import type { Section, CampaignContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as CampaignContent | null
</script>

<template>
  <div class="flex flex-1 gap-8 justify-between items-end border-y py-4 px-6" style="border-color: var(--theme-main)">
    <h1 class="text-6xl font-bold leading-none tracking-tight" style="color: var(--theme-main)">{{ c?.title }}</h1>
    <input
      type="email"
      :placeholder="c?.placeholder || 'email@example.com'"
      class="border-b bg-transparent outline-none text-sm pb-1 shrink-0"
      style="border-color: var(--theme-main); color: var(--theme-main)"
    />
  </div>
</template>
