<script setup lang="ts">
import Popover from '@/components/ui/Popover.vue'
import Icon from '@/components/ui/Icon.vue'
import SliderRow from './SliderRow.vue'
import ColorRow from './ColorRow.vue'
import SelectRow from './SelectRow.vue'
import type { StyleControl } from './types'

const props = defineProps<{
  icon: string
  title: string
  controls: StyleControl[]
  styles: Record<string, unknown>
  defaults: Record<string, unknown>
}>()

const emit = defineEmits<{
  update: [key: string, value: unknown]
}>()

function getValue<T>(key: string, defaultValue: T): T {
  const val = props.styles[key]
  if (val !== undefined && val !== null) {
    return val as T
  }
  const defVal = props.defaults[key]
  if (defVal !== undefined && defVal !== null) {
    return defVal as T
  }
  return defaultValue
}
</script>

<template>
  <div class="px-4 py-3 border-b border-border/50">
    <Popover side="left" width="w-80">
      <template #trigger="{ toggle }">
        <button
          @click="toggle"
          class="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
        >
          <div class="flex items-center gap-2">
            <Icon :name="icon" :size="14" class="text-muted-foreground" />
            <span class="text-xs font-medium text-foreground">{{ title }}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Edit</span>
        </button>
      </template>
      <div class="p-4 flex flex-col gap-3">
        <template v-for="control in controls" :key="control.key">
          <SliderRow
            v-if="control.type === 'slider'"
            :label="control.label"
            :model-value="getValue<number>(control.key, 0)"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            :unit="control.unit"
            @update:model-value="emit('update', control.key, $event)"
          />
          <ColorRow
            v-else-if="control.type === 'color'"
            :label="control.label"
            :model-value="getValue<string>(control.key, '')"
            @update:model-value="emit('update', control.key, $event)"
          />
          <SelectRow
            v-else-if="control.type === 'select'"
            :label="control.label"
            :model-value="getValue<string>(control.key, '')"
            :options="control.options"
            @update:model-value="emit('update', control.key, $event)"
          />
        </template>
      </div>
    </Popover>
  </div>
</template>
