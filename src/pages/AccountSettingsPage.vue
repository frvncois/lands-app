<script setup lang="ts">
import { Header } from '@/components/ui'
import SettingsRenderer from '@/components/settings/SettingsRenderer.vue'
import { ACCOUNT_SETTINGS } from '@/settings/accountSettings'
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Account Settings"
        description="Manage your profile, preferences, and projects."
      />

      <SettingsRenderer :sections="ACCOUNT_SETTINGS" />
    </div>
  </div>
</template>
