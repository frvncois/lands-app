<script setup lang="ts">
import { computed } from 'vue'
import { getAllThemes } from '@/lib/themes'
import type { Theme } from '@/types/sections'

const props = defineProps<{
  selectedThemeId?: string
}>()

const emit = defineEmits<{
  select: [themeId: string]
}>()

const themes = computed(() => getAllThemes())
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">
      Choose a visual style for your landing page. You can customize colors and fonts in the next step.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="theme in themes"
        :key="theme.id"
        class="group relative p-6 border-2 rounded-xl transition-all text-left overflow-hidden"
        :class="[
          selectedThemeId === theme.id
            ? 'border-primary bg-accent/30'
            : 'border-border hover:border-primary/50 hover:bg-accent/20'
        ]"
        @click="emit('select', theme.id)"
      >
        <!-- Selected indicator -->
        <div
          v-if="selectedThemeId === theme.id"
          class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Color swatches preview -->
        <div class="flex gap-2 mb-4">
          <div
            class="w-12 h-12 rounded-lg shadow-sm border border-black/10"
            :style="{ backgroundColor: theme.tokens.colors.background }"
          />
          <div class="flex flex-col gap-1">
            <div
              class="w-8 h-5 rounded shadow-sm"
              :style="{ backgroundColor: theme.tokens.colors.primary }"
            />
            <div
              class="w-8 h-5 rounded shadow-sm"
              :style="{ backgroundColor: theme.tokens.colors.accent }"
            />
          </div>
        </div>

        <!-- Theme info -->
        <div>
          <div class="font-semibold text-foreground mb-1">{{ theme.name }}</div>
          <div class="text-sm text-muted-foreground leading-relaxed">
            {{ theme.description }}
          </div>
        </div>

        <!-- Font preview -->
        <div class="mt-4 pt-4 border-t border-border/50">
          <div class="text-xs text-muted-foreground mb-2">Typography</div>
          <div class="space-y-1">
            <div
              class="text-sm font-semibold"
              :style="{ fontFamily: theme.tokens.fonts.heading }"
            >
              {{ theme.tokens.fonts.heading.split(',')[0] }}
            </div>
            <div
              class="text-xs text-muted-foreground"
              :style="{ fontFamily: theme.tokens.fonts.body }"
            >
              {{ theme.tokens.fonts.body.split(',')[0] }}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
