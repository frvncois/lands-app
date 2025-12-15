<script setup lang="ts">
import { PROJECT_NAV } from '@/settings/projectSettings'
import { useFeatureGate } from '@/composables/useFeatureGate'
import { ANALYTICS_SECTIONS } from './AnalyticsSections'
import { Header } from '@/components/ui'
import SettingsRenderer from '@/components/settings/SettingsRenderer.vue'
import AnalyticsUpgradeWall from './sections/AnalyticsUpgradeWall.vue'

const analyticsSection = PROJECT_NAV.find(s => s.routeName === 'analytics')!
const { allowed } = useFeatureGate(analyticsSection)
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Analytics"
        description="Track your site's performance and visitor data."
      />

      <AnalyticsUpgradeWall v-if="!allowed" />

      <SettingsRenderer
        v-else
        :sections="ANALYTICS_SECTIONS"
      />
    </div>
  </div>
</template>
