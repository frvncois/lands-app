<script setup lang="ts">
import { computed } from 'vue'
import { getAllCategories, type PresetCategory } from '@/lib/presets'
import Icon from '@/components/ui/Icon.vue'

const emit = defineEmits<{
  select: [category: PresetCategory]
  startBlank: []
}>()

const categories = computed(() => getAllCategories())

// Icon mapping for presets
function getIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    'music': 'content-icon',
    'guitar': 'content-icon',
    'microphone': 'content-icon',
    'dinner': 'content-icon',
    'coffee': 'content-icon',
    'beer': 'content-icon',
    'briefcase': 'app-editor',
    'camera': 'content-image',
    'video': 'content-video',
    'code': 'content-icon',
    'palette': 'style-color',
    'shopping-cart': 'list-product',
    'calendar': 'content-icon',
    'users': 'app-collaborators',
    'home': 'app-dashboard',
    'add': '+',
  }
  return iconMap[icon] || 'content-icon'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Category Grid -->
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="category in categories"
        :key="category.id"
        class="flex flex-col items-start gap-3 p-5 border-2 border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all text-left group"
        @click="emit('select', category)"
      >
        <div class="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
          <Icon
            :name="getIconName(category.icon)"
            class="text-primary"
            :size="24"
          />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-foreground mb-1">
            {{ category.name }}
          </div>
          <div class="text-sm text-muted-foreground leading-relaxed">
            {{ category.description }}
          </div>
        </div>
      </button>
    </div>

    <!-- Blank Option -->
    <div class="pt-4 border-t border-border">
      <button
        class="w-full flex items-center gap-4 p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
        @click="emit('startBlank')"
      >
        <div class="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
          <Icon
            name="+"
            class="text-muted-foreground group-hover:text-primary"
            :size="24"
          />
        </div>
        <div class="text-left">
          <div class="font-semibold text-foreground">
            Start from scratch
          </div>
          <div class="text-sm text-muted-foreground">
            Begin with a blank canvas
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
