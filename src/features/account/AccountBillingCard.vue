<script setup lang="ts">
import { Card, Button, Icon } from '@/components/ui'
</script>

<template>
  <Card>
    <Card.Header title="Payment Method" icon="lni-credit-card-multiple" />
    <Card.Content>
      <div class="flex items-center justify-between p-4 border border-dashed border-border rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon name="credit-card-multiple" class="text-muted-foreground" />
          </div>
          <div>
            <p class="text-xs text-muted-foreground">No payment method added</p>
            <p class="text-xxs text-muted-foreground/70">Add a card to upgrade your projects</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Add Card
        </Button>
      </div>
    </Card.Content>
  </Card>
</template>
