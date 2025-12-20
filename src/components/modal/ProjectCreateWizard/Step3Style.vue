<script setup lang="ts">
import { computed } from 'vue'
import { HEADING_FONTS, BODY_FONTS, COLOR_PALETTES } from '@/lib/layouts'

const headingFont = defineModel<string>('headingFont', { required: true })
const bodyFont = defineModel<string>('bodyFont', { required: true })
const paletteId = defineModel<string>('paletteId', { required: true })

const selectedPalette = computed(() =>
  COLOR_PALETTES.find(p => p.id === paletteId.value)
)
</script>

<template>
  <div class="space-y-6">
    <!-- Font Selection -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Heading Font -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Heading Font</label>
        <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
          <button
            v-for="font in HEADING_FONTS"
            :key="font.id"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 transition-all hover:bg-muted"
            :class="headingFont === font.family
              ? 'border-primary bg-primary/5'
              : 'border-border'"
            @click="headingFont = font.family"
          >
            <span
              class="text-base"
              :style="{ fontFamily: font.family }"
            >
              {{ font.name }}
            </span>
            <span class="text-[10px] text-muted-foreground uppercase">{{ font.category }}</span>
          </button>
        </div>
      </div>

      <!-- Body Font -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Body Font</label>
        <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
          <button
            v-for="font in BODY_FONTS"
            :key="font.id"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 transition-all hover:bg-muted"
            :class="bodyFont === font.family
              ? 'border-primary bg-primary/5'
              : 'border-border'"
            @click="bodyFont = font.family"
          >
            <span
              class="text-sm"
              :style="{ fontFamily: font.family }"
            >
              {{ font.name }}
            </span>
            <span class="text-[10px] text-muted-foreground uppercase">{{ font.category }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Color Palette -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-foreground">Color Palette</label>
      <div class="grid grid-cols-5 gap-3">
        <button
          v-for="palette in COLOR_PALETTES"
          :key="palette.id"
          type="button"
          class="p-3 rounded-xl border-2 transition-all hover:scale-[1.02]"
          :class="paletteId === palette.id
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border'"
          :style="{ backgroundColor: palette.colors.background }"
          @click="paletteId = palette.id"
        >
          <div class="flex gap-1 mb-2 justify-center">
            <div
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: palette.colors.primary }"
            />
            <div
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: palette.colors.accent }"
            />
          </div>
          <p
            class="text-[10px] font-medium text-center truncate"
            :style="{ color: palette.colors.foreground }"
          >
            {{ palette.name }}
          </p>
        </button>
      </div>
    </div>

    <!-- Preview -->
    <div
      class="p-5 rounded-xl border border-border"
      :style="{
        backgroundColor: selectedPalette?.colors.background,
        color: selectedPalette?.colors.foreground,
      }"
    >
      <h3
        class="text-xl font-bold mb-2"
        :style="{ fontFamily: headingFont }"
      >
        Preview Heading
      </h3>
      <p
        class="text-sm mb-4"
        :style="{
          fontFamily: bodyFont,
          color: selectedPalette?.colors.muted,
        }"
      >
        This is how your body text will look. The quick brown fox jumps over the lazy dog.
      </p>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium"
        :style="{
          backgroundColor: selectedPalette?.colors.primary,
          color: selectedPalette?.colors.background,
        }"
      >
        Sample Button
      </button>
    </div>
  </div>
</template>
