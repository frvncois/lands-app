<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormRadioSettings } from '@/types/editor'

/**
 * FormRadioBlock - Renders a group of radio buttons
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormRadioSettings)
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
          type="radio"
          :name="block.id"
          :value="option.value"
          :required="settings?.required"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
