<script setup lang="ts">
import { useAccountActions } from './useAccountActions'
import { Card, ToggleItem } from '@/components/ui'

const { settings, updatePreferences } = useAccountActions()
</script>

<template>
  <Card>
    <Card.Header title="Notifications" icon="lni-bell-1" />
    <Card.Content class="space-y-4">
      <ToggleItem
        :model-value="settings.preferences.emailNotifications"
        label="Email Notifications"
        description="Receive updates about your projects"
        @update:model-value="updatePreferences({ emailNotifications: $event })"
      />

      <ToggleItem
        :model-value="settings.preferences.marketingEmails"
        label="Marketing Emails"
        description="Receive tips, news, and offers"
        @update:model-value="updatePreferences({ marketingEmails: $event })"
      />
    </Card.Content>
  </Card>
</template>
