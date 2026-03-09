<script setup lang="ts">
import type { Section, CampaignContent, CampaignSettings } from '@/types/section'

const props = defineProps<{ section: Section }>()
const c = props.section.content as CampaignContent | null
const s = props.section.settings_json as CampaignSettings
</script>

<template>
  <div class="px-6 py-10">
    <div class="max-w-lg mx-auto flex flex-col gap-5">
      <div class="flex flex-col gap-2 pb-4 border-b-2" style="border-color: var(--theme-accent)">
        <p class="text-xs font-medium tracking-widest uppercase" style="color: var(--theme-accent)">Newsletter</p>
        <p class="text-xl font-semibold leading-snug" style="color: var(--theme-main)">{{ c?.title }}</p>
        <p class="text-sm leading-relaxed text-gray-500 italic">{{ c?.description }}</p>
      </div>
      <div class="flex flex-col gap-2">
        <input v-if="s?.show_name_field" type="text" placeholder="Your name" class="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" />
        <input type="email" :placeholder="c?.placeholder || 'Your email address'" class="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" />
        <button class="w-full py-2.5 text-sm font-medium rounded-lg" style="background: var(--theme-accent); color: white">{{ c?.button_label }}</button>
      </div>
    </div>
  </div>
</template>
