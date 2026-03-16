<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/lib/utils/markdown'
import type { Section, TextContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.content as TextContent | null)

const bodyHtml = computed(() => {
  const b = content.value?.body ?? ''
  return b.startsWith('<') ? b : renderMarkdown(b)
})

const alignClass = computed(() => {
  const v = props.section.style_variant
  if (v === 'centered') return 'items-center text-center'
  return 'items-start'
})

const proseWidthClass = computed(() => {
  const v = props.section.style_variant
  if (v === 'wide') return 'max-w-none px-0'
  if (v === 'centered') return 'max-w-2xl mx-auto px-6'
  return 'max-w-none px-6'
})
</script>

<template>
  <div class="py-5" :class="proseWidthClass">
    <div class="flex flex-col gap-3" :class="alignClass">
      <p v-if="content?.subtitle" class="text-xs font-medium tracking-wide uppercase" style="color: var(--theme-accent)">{{ content.subtitle }}</p>
      <h2 v-if="content?.title" class="text-xl font-semibold leading-tight" style="color: var(--theme-main)">{{ content.title }}</h2>
      <div
        v-if="content?.body"
        class="prose prose-sm max-w-none text-sm leading-relaxed"
        style="--tw-prose-headings: var(--theme-main); --tw-prose-links: var(--theme-accent)"
        v-html="bodyHtml"
      />
      <div v-if="content?.buttons?.length" class="flex flex-wrap gap-2 pt-1">
        <a
          v-for="btn in content.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style="background: var(--theme-accent); color: var(--theme-surface)"
        >{{ btn.label }}</a>
      </div>
    </div>
  </div>
</template>
