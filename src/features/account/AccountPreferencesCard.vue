<script setup lang="ts">
import { useAccountActions } from './useAccountActions'
import { Card, RadioGroup } from '@/components/ui'

const { settings, updatePreferences } = useAccountActions()

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
</script>

<template>
  <Card>
    <Card.Header title="System theme" icon="lni-sun-1" />
    <Card.Content>
      <RadioGroup
        :model-value="settings.preferences.theme"
        orientation="horizontal"
        @update:model-value="updatePreferences({ theme: $event as 'light' | 'dark' | 'system' })"
      >
        <RadioGroup.Option
          v-for="option in themeOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
        />
      </RadioGroup>
    </Card.Content>
  </Card>
</template>
