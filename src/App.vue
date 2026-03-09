<script setup lang="ts">
import { onMounted } from 'vue'
import { initMockData } from '@/lib/mock/init'
import { useThemeVars } from '@/composables/useThemeVars'

useThemeVars()

onMounted(() => {
  initMockData()
})
</script>

<template>
  <RouterView />
</template>
