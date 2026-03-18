<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import CampaignMinimal from './campaign/CampaignMinimal.vue'
import CampaignBaseline from './campaign/CampaignBaseline.vue'
import CampaignStructure from './campaign/CampaignStructure.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return CampaignStructure
    case 'baseline': return CampaignBaseline
    default: return CampaignMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
