<script setup lang="ts">
import { Card, Icon } from '@/components/ui'
</script>

<template>
  <Card>
    <Card.Header
      title="Invoices"
      icon="lni-clipboard"
    />
    <Card.Content>
      <div class="flex flex-col items-center justify-center py-6 text-center">
        <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
          <Icon
            name="clipboard"
            class="text-muted-foreground"
          />
        </div>
        <p class="text-xs text-muted-foreground">
          No invoices yet
        </p>
        <p class="text-xxs text-muted-foreground/70">
          Your billing history will appear here
        </p>
      </div>
    </Card.Content>
  </Card>
</template>
