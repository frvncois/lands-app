<script setup lang="ts">
import { Button, Icon } from '@/components/ui'

const emit = defineEmits<{
  create: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
    <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Icon name="layers-1" class="text-3xl text-muted-foreground" />
    </div>
    <h3 class="text-lg font-medium text-foreground mb-1">No projects yet</h3>
    <p class="text-sm text-muted-foreground mb-4">Create your first project to get started.</p>
    <Button @click="emit('create')">
      <Icon name="plus" class="text-sm" />
      Create Project
    </Button>
  </div>
</template>
