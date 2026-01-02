<script setup lang="ts">
import { computed } from 'vue'

export interface ColorPalette {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    accent: string
    background: string
  }
}

export interface FontPairing {
  id: string
  name: string
  description: string
  fonts: {
    heading: string
    body: string
  }
}

const props = defineProps<{
  selectedPaletteId?: string
  selectedFontPairingId?: string
}>()

const emit = defineEmits<{
  selectPalette: [paletteId: string]
  selectFont: [fontPairingId: string]
}>()

const colorPalettes = computed<ColorPalette[]>(() => [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Blues and grays for a clean, professional look',
    colors: {
      primary: '#3b82f6',
      accent: '#0f172a',
      background: '#f8fafc',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Oranges and earth tones for a welcoming feel',
    colors: {
      primary: '#f59e0b',
      accent: '#78350f',
      background: '#fef3c7',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Greens and natural tones for organic brands',
    colors: {
      primary: '#10b981',
      accent: '#14532d',
      background: '#f0fdf4',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep purples for a creative, mysterious vibe',
    colors: {
      primary: '#6366f1',
      accent: '#1e1b4b',
      background: '#eef2ff',
    },
  },
  {
    id: 'cream',
    name: 'Cream',
    description: 'Soft neutrals for an elegant, timeless look',
    colors: {
      primary: '#d97706',
      accent: '#292524',
      background: '#fef7ee',
    },
  },
])

const fontPairings = computed<FontPairing[]>(() => [
  {
    id: 'modern-clean',
    name: 'Modern & Clean',
    description: 'Perfect for tech and startups',
    fonts: {
      heading: 'Satoshi, sans-serif',
      body: 'Satoshi, sans-serif',
    },
  },
  {
    id: 'classic-elegant',
    name: 'Classic & Elegant',
    description: 'Timeless and professional',
    fonts: {
      heading: 'Quilon, serif',
      body: 'Public Sans, sans-serif',
    },
  },
  {
    id: 'bold-impact',
    name: 'Bold & Impact',
    description: 'Strong and attention-grabbing',
    fonts: {
      heading: 'Clash Grotesk, sans-serif',
      body: 'Author, sans-serif',
    },
  },
  {
    id: 'friendly-warm',
    name: 'Friendly & Warm',
    description: 'Approachable and inviting',
    fonts: {
      heading: 'Telma, sans-serif',
      body: 'Familjen Grotesk, sans-serif',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Refined for content-focused sites',
    fonts: {
      heading: 'Instrument Serif, serif',
      body: 'Author, sans-serif',
    },
  },
])
</script>

<template>
  <div class="space-y-8">
    <!-- Color Palette Selection -->
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-foreground mb-1">Color Palette</h3>
        <p class="text-sm text-muted-foreground">
          Choose a color scheme for your landing page
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="palette in colorPalettes"
          :key="palette.id"
          class="group relative p-5 border-2 rounded-xl transition-all text-left"
          :class="[
            selectedPaletteId === palette.id
              ? 'border-primary bg-accent/30'
              : 'border-border hover:border-primary/50 hover:bg-accent/20'
          ]"
          @click="emit('selectPalette', palette.id)"
        >
          <!-- Selected indicator -->
          <div
            v-if="selectedPaletteId === palette.id"
            class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Color swatches -->
          <div class="flex gap-2 mb-4">
            <div
              class="w-12 h-12 rounded-lg shadow-sm border border-black/10"
              :style="{ backgroundColor: palette.colors.background }"
            />
            <div class="flex flex-col gap-1">
              <div
                class="w-8 h-5 rounded shadow-sm"
                :style="{ backgroundColor: palette.colors.primary }"
              />
              <div
                class="w-8 h-5 rounded shadow-sm"
                :style="{ backgroundColor: palette.colors.accent }"
              />
            </div>
          </div>

          <!-- Palette info -->
          <div>
            <div class="font-semibold text-foreground mb-1">{{ palette.name }}</div>
            <div class="text-sm text-muted-foreground leading-relaxed">
              {{ palette.description }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Font Pairing Selection -->
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-foreground mb-1">Font Pairing</h3>
        <p class="text-sm text-muted-foreground">
          Choose typography that matches your brand
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="pairing in fontPairings"
          :key="pairing.id"
          class="group relative p-5 border-2 rounded-xl transition-all text-left"
          :class="[
            selectedFontPairingId === pairing.id
              ? 'border-primary bg-accent/30'
              : 'border-border hover:border-primary/50 hover:bg-accent/20'
          ]"
          @click="emit('selectFont', pairing.id)"
        >
          <!-- Selected indicator -->
          <div
            v-if="selectedFontPairingId === pairing.id"
            class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Font preview -->
          <div class="mb-4 space-y-2">
            <div
              class="text-xl font-semibold"
              :style="{ fontFamily: pairing.fonts.heading }"
            >
              Aa
            </div>
            <div
              class="text-sm text-muted-foreground"
              :style="{ fontFamily: pairing.fonts.body }"
            >
              The quick brown fox jumps over the lazy dog
            </div>
          </div>

          <!-- Pairing info -->
          <div>
            <div class="font-semibold text-foreground mb-1">{{ pairing.name }}</div>
            <div class="text-sm text-muted-foreground leading-relaxed">
              {{ pairing.description }}
            </div>
          </div>

          <!-- Font names -->
          <div class="mt-3 pt-3 border-t border-border/50">
            <div class="text-xs text-muted-foreground space-y-0.5">
              <div>Heading: {{ pairing.fonts.heading.split(',')[0] }}</div>
              <div>Body: {{ pairing.fonts.body.split(',')[0] }}</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
