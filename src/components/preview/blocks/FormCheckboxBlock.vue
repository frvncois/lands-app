<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormCheckboxSettings } from '@/types/editor'

/**
 * FormCheckboxBlock - Renders a group of checkboxes
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormCheckboxSettings)
</script>

<template>
  <div :style="styles">
    <div :class="settings?.layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'">
      <label
        v-for="option in settings?.options || []"
        :key="option.id"
        class="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          :name="`${block.id}_${option.value}`"
          :value="option.value"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
