<script setup lang="ts">
import { Card, Skeleton } from '@/components/ui'
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card
      v-for="i in 6"
      :key="i"
      padded
    >
      <Skeleton class="aspect-video rounded-xl mb-3" />
      <div class="space-y-3">
        <div class="space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/2" />
        </div>
        <div class="flex items-center gap-3">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
    </Card>
  </div>
</template>
