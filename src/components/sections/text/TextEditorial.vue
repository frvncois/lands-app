<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/lib/utils/markdown'
import type { Section, TextContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const body = computed(() => (props.section.content as TextContent | null)?.body ?? '')
const html = computed(() => body.value.startsWith('<') ? body.value : renderMarkdown(body.value))
</script>

<template>
  <div
    class="px-6 py-8 prose max-w-none prose-headings:font-bold prose-headings:tracking-normal prose-p:leading-loose prose-p:text-gray-600"
    style="--tw-prose-headings: var(--theme-main); --tw-prose-links: var(--theme-accent)"
    v-html="html"
  />
</template>
