<script setup lang="ts">
import type { Section, CampaignContent, CampaignSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as CampaignContent | null
const s = props.section.settings_json as CampaignSettings
const minimal = props.section.style_variant === 'minimal'
</script>

<template>
  <div class="overflow-hidden rounded-4xl mx-10 py-16" style="background: var(--theme-surface)">
    <div class="max-w-3xl mx-auto flex flex-col gap-8 text-center px-8">
      <h1 v-if="!minimal" class="text-6xl font-bold leading-none tracking-tight" style="color: var(--theme-main)">{{ c?.title }}</h1>wef
      <div class="flex flex-col gap-2 max-w-sm mx-auto w-full">
        <input v-if="s?.show_name_field" type="text" placeholder="Your name" class="w-full px-4 py-3 text-sm border-2 rounded-2xl outline-none" style="border-color: var(--theme-main)" />
        <div class="flex gap-2">
          <input type="email" :placeholder="c?.placeholder || 'email@example.com'" class="flex-1 px-4 py-3 text-sm border-2 rounded-2xl outline-none" style="border-color: var(--theme-main)" />
          <button class="px-5 py-3 text-sm font-bold rounded-2xl shrink-0 text-white" style="background: var(--theme-main)">{{ c?.button_label }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
