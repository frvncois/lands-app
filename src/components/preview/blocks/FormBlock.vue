<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, FormStyles } from '@/types/editor'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * FormBlock - Renders a form with child form field blocks
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const formStyles = computed(() => props.block.styles as FormStyles)
</script>

<template>
  <form
    class="flex"
    :style="{
      ...styles,
      flexDirection: formStyles?.flexDirection || 'column',
      justifyContent: formStyles?.justifyContent || 'flex-start',
      alignItems: formStyles?.alignItems || 'stretch',
      gap: formStyles?.gap || '16px'
    }"
    @submit.prevent
  >
    <PreviewSection
      v-for="(child, childIndex) in block.children || []"
      :key="child.id"
      :block="child"
      :index="childIndex"
      :total="(block.children || []).length"
    />
    <p v-if="!block.children?.length" class="text-sm text-muted-foreground text-center py-4">
      Add form fields using the sidebar
    </p>
  </form>
</template>
