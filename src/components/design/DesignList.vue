<script setup>
import DesignThemes from '@/components/design/DesignThemes.vue'
import DesignColors from '@/components/design/DesignColors.vue'
import DesignFonts from '@/components/design/DesignFonts.vue'
import DesignLayout from '@/components/design/DesignLayout.vue'

const props = defineProps(['project'])
</script>

<template>
  <ul class="list" v-if="props.project">
    <li><DesignThemes :project="props.project" /></li>
    <li><DesignColors :project="props.project" /></li>
    <li><DesignFonts :project="props.project" /></li>
    <li><DesignLayout :project="props.project" /></li>
  </ul>
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
}
</style>