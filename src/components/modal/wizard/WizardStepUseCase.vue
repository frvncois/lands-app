<script setup lang="ts">
import { computed } from 'vue'
import { getPresetsForCategory, type UseCasePreset } from '@/lib/presets'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{
  categoryId: string
}>()

const emit = defineEmits<{
  select: [preset: UseCasePreset]
}>()

const useCases = computed(() => getPresetsForCategory(props.categoryId))

// Icon mapping for presets
function getIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    'music': 'content-icon',
    'guitar': 'content-icon',
    'microphone': 'content-icon',
    'vinyl': 'content-icon',
    'heart': 'content-icon',
    'headphones': 'content-icon',
    'speaker': 'content-icon',
    'dinner': 'content-icon',
    'coffee': 'content-icon',
    'beer': 'content-icon',
    'wine': 'content-icon',
    'utensils': 'content-icon',
    'chef': 'content-icon',
    'cake': 'content-icon',
    'truck': 'content-icon',
    'pen': 'content-icon',
    'briefcase': 'app-editor',
    'camera': 'content-image',
    'video': 'content-video',
    'code': 'content-icon',
    'palette': 'style-color',
    'shopping-cart': 'list-product',
    'tag': 'content-icon',
    'download': 'app-publish',
    'dollar': 'content-icon',
    'calendar': 'content-icon',
    'clock': 'content-icon',
    'users': 'app-collaborators',
    'tool': 'content-icon',
    'sun': 'content-icon',
    'frame': 'content-image',
    'shopping-bag': 'list-product',
    'user': 'app-user',
    'image': 'content-image',
    'file': 'content-icon',
    'link': 'list-link',
    'star': 'content-icon',
    'credit-card': 'list-product',
    'rocket': 'content-icon',
    'mobile': 'content-icon',
    'megaphone': 'content-icon',
    'list': 'list-link',
    'chart-up': 'app-analytics',
    'home': 'app-dashboard',
    'hammer': 'content-icon',
    'tree': 'content-icon',
    'spray': 'content-icon',
    'car': 'content-icon',
    'dumbbell': 'content-icon',
    'scissors': 'content-icon',
    'map-marker': 'content-icon',
    'hand': 'content-icon',
  }
  return iconMap[icon] || 'content-icon'
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <button
      v-for="preset in useCases"
      :key="preset.id"
      class="flex flex-col items-start gap-3 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all text-left group"
      @click="emit('select', preset)"
    >
      <div class="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
        <Icon
          :name="getIconName(preset.icon)"
          class="text-primary"
          :size="20"
        />
      </div>
      <div class="flex-1">
        <div class="font-semibold text-sm text-foreground mb-1">
          {{ preset.name }}
        </div>
        <div class="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {{ preset.description }}
        </div>
      </div>

      <!-- Tags if available -->
      <div
        v-if="preset.tags && preset.tags.length > 0"
        class="flex flex-wrap gap-1"
      >
        <span
          v-for="tag in preset.tags.slice(0, 3)"
          :key="tag"
          class="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
        >
          {{ tag }}
        </span>
      </div>
    </button>
  </div>
</template>
