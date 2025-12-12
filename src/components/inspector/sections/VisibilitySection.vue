<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import ToggleInput from '../ToggleInput.vue'

defineProps<{
  hideOnDesktop?: boolean
  hideOnTablet?: boolean
  hideOnMobile?: boolean
}>()

const emit = defineEmits<{
  'update:hideOnDesktop': [value: boolean]
  'update:hideOnTablet': [value: boolean]
  'update:hideOnMobile': [value: boolean]
}>()
</script>

<template>
  <InspectorSection title="Visibility" icon="app-show">
    <div class="space-y-2">
      <ToggleInput
        :model-value="hideOnDesktop ?? false"
        label="Hide on Desktop"
        @update:model-value="emit('update:hideOnDesktop', $event)"
      />
      <ToggleInput
        :model-value="hideOnTablet ?? false"
        label="Hide on Tablet"
        @update:model-value="emit('update:hideOnTablet', $event)"
      />
      <ToggleInput
        :model-value="hideOnMobile ?? false"
        label="Hide on Mobile"
        @update:model-value="emit('update:hideOnMobile', $event)"
      />
    </div>
  </InspectorSection>
</template>
