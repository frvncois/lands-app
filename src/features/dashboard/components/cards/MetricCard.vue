<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

defineProps<{
  icon: FunctionalComponent
  title: string
  animationDelay?: number
  showViewMore?: boolean
}>()

defineEmits<{
  viewMore: []
}>()
</script>

<template>
  <BaseCard
    variant="spaced"
    :icon="icon"
    :title="title"
    class="shrink-0 card-appear"
    :style="animationDelay !== undefined ? `animation-delay: ${animationDelay}ms` : ''"
  >
    <template v-if="showViewMore" #header-action>
      <button
        class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        @click="$emit('viewMore')"
      >
        View More <ArrowRightIcon class="h-3 w-3" />
      </button>
    </template>
    <slot />
  </BaseCard>
</template>
