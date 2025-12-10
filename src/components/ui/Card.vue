<script setup lang="ts">
type CardVariant = 'default' | 'outline' | 'ghost' | 'destructive'

interface Props {
  variant?: CardVariant
  hoverable?: boolean
  padded?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
  padded: false,
})

const variantClasses: Record<CardVariant, string> = {
  default: 'border bg-card border-border/25 shadow-xs',
  outline: 'bg-transparent border border-border',
  ghost: 'bg-muted/50 border border-transparent',
  destructive: 'bg-card border border-destructive/30',
}
</script>

<script lang="ts">
import CardHeader from './CardHeader.vue'
import CardContent from './CardContent.vue'
import CardFooter from './CardFooter.vue'
import CardThumbnail from './CardThumbnail.vue'

export default {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
  Thumbnail: CardThumbnail,
}
</script>

<template>
  <div
    :class="[
      'rounded-2xl',
      variantClasses[variant],
      hoverable ? 'hover:border-muted-foreground/25 transition-colors cursor-pointer' : '',
      padded ? 'p-5' : '',
    ]"
  >
    <slot />
  </div>
</template>
