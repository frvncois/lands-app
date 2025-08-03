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
    
    <li>
      <label>Layout settings</label>
    </li>
    
    <li>
      <DesignColors 
        :project="props.project" 
        :user-store="userStore"
      />
    </li>
    
    <li>
      <DesignFonts 
        :project="props.project" 
        :user-store="userStore"
      />
    </li>
    
    <li>
      <DesignLayout 
        :project="props.project" 
        :user-store="userStore"
      />
    </li>
    
    <li>
      <CTABasic 
        title="Need a custom theme?" 
        description="Join thousands of creators"
        buttonLabel="Learn more"
        buttonStyle="light"
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