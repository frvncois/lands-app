<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

function requestIntegration() {
  // Open feedback form or email
  window.open('mailto:support@lands.app?subject=Integration Request', '_blank')
}
</script>

<template>
  <div class="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
    <div class="text-xs text-muted-foreground">
      Need a different integration?
    </div>
    <Button
      variant="ghost"
      size="sm"
      @click="requestIntegration"
    >
      <Icon
        name="message-dots"
        :size="12"
      />
      Request
    </Button>
  </div>
</template>
