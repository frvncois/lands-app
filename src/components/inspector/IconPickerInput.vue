<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui'
import LucideIconPicker from '@/components/modal/LucideIconPicker.vue'
import { icons, formatIconName } from '@/lib/lucide-icons'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)

// Get the current icon component
const currentIcon = computed(() => {
  if (!props.modelValue) return null
  return icons[props.modelValue] || null
})

// Handle icon selection from picker
function handleIconSelect(iconName: string) {
  emit('update:modelValue', iconName)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Icon preview button -->
    <button
      type="button"
      class="w-9 h-9 flex items-center justify-center bg-background border border-border rounded-md hover:border-primary/50 transition-colors"
      @click="showPicker = true"
    >
      <component
        v-if="currentIcon"
        :is="currentIcon"
        class="w-5 h-5 text-foreground"
      />
      <span v-else class="text-muted-foreground text-xs">?</span>
    </button>

    <!-- Name + Select button -->
    <div class="flex-1 flex items-center gap-2 min-w-0">
      <span class="text-sm text-foreground truncate flex-1">
        {{ modelValue ? formatIconName(modelValue) : 'No icon selected' }}
      </span>
      <Button variant="outline" size="sm" @click="showPicker = true">
        Select
      </Button>
    </div>
  </div>

  <!-- Icon picker modal -->
  <LucideIconPicker
    :open="showPicker"
    :selected-icon="modelValue"
    @update:open="showPicker = $event"
    @select="handleIconSelect"
  />
</template>
