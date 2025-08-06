<script setup>
import DesignThemes from '@/components/design/DesignThemes.vue'
import DesignColors from '@/components/design/DesignColors.vue'
import DesignFonts from '@/components/design/DesignFonts.vue'
import DesignLayout from '@/components/design/DesignLayout.vue'
import CTABasic from '@/components/global/CTABasic.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <ul class="items" v-if="props.project">
    <li>
      <DesignThemes 
        :project="props.project" 
        :user-store="userStore"
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