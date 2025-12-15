<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormSelectSettings } from '@/types/editor'

/**
 * FormSelectBlock - Renders a form select/dropdown element
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormSelectSettings)
</script>

<template>
  <div>
    <select
      :required="settings?.required"
      class="px-4 py-2 border border-input bg-background"
      :style="styles"
    >
      <option v-if="settings?.placeholder" value="" disabled selected>
        {{ settings.placeholder }}
      </option>
      <option
        v-for="option in settings?.options || []"
        :key="option.id"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
