<script setup>
import DesignThemes from '@/components/design/DesignThemes.vue'
import DesignColors from '@/components/design/DesignColors.vue'
import DesignFonts from '@/components/design/DesignFonts.vue'
import DesignLayout from '@/components/design/DesignLayout.vue'
import CTABasic from '@/components/global/CTABasic.vue'

const props = defineProps(['project'])
</script>

<template>
  <ul class="items" v-if="props.project">
    <li><DesignThemes :project="props.project" /></li>
    <li><label>Layout settings</label></li>
    <li><DesignColors :project="props.project" /></li>
    <li><DesignFonts :project="props.project" /></li>
    <li><DesignLayout :project="props.project" /></li>
    <li>
      <CTABasic 
        title="Need a custom theme?" 
        description="Join thousands of creators"
        buttonLabel="Learn more"
        buttonStyle="light"
        @click="openSignupModal"
    />
    </li>
  </ul>
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
}
</style>