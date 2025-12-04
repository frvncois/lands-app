<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { ProductItem, ProductSectionSettings } from '@/types/editor'

const props = defineProps<{
  product: ProductItem
  settings: ProductSectionSettings
  blockId: string
}>()

const editorStore = useEditorStore()

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.blockId &&
  editorStore.selectedItemId === props.product.id
)

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.blockId, props.product.id)
}
</script>

<template>
  <div
    class="relative group bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
    @click="handleClick"
  >
    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute -inset-1 border-2 border-primary rounded-lg pointer-events-none z-10"
    />

    <!-- Image -->
    <div v-if="settings.showImage" class="aspect-square bg-secondary">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.heading"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted-foreground"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 v-if="settings.showHeading" class="font-semibold text-foreground">
        {{ product.heading }}
      </h3>
      <p v-if="settings.showSubtitle" class="text-sm text-muted-foreground mt-1">
        {{ product.subtitle }}
      </p>
      <p v-if="settings.showText" class="text-sm text-muted-foreground mt-2 line-clamp-2">
        {{ product.text }}
      </p>
      <p v-if="settings.showPrice" class="font-bold text-foreground mt-3">
        {{ product.price }}
      </p>
      <a
        v-if="settings.showButton"
        :href="product.buttonLink"
        class="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        @click.prevent
      >
        {{ product.buttonTitle }}
      </a>
    </div>
  </div>
</template>
