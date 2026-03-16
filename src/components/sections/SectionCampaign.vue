<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import CampaignMinimal from './campaign/CampaignMinimal.vue'
import CampaignBold from './campaign/CampaignBold.vue'
import CampaignEditorial from './campaign/CampaignEditorial.vue'
import CampaignStructure from './campaign/CampaignStructure.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return CampaignBold
    case 'editorial': return CampaignEditorial
    case 'structure': return CampaignStructure
    default: return CampaignMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
