<script setup lang="ts">
import { computed } from 'vue'
import { getTemplateFromPreset } from '@/lib/presets'
import type { ColorPalette, FontPairing } from './WizardStepStyle.vue'

const props = defineProps<{
  categoryName?: string
  useCaseName?: string
  presetId?: string
  themeName?: string
  palette?: ColorPalette
  fontPairing?: FontPairing
  projectName?: string
}>()

// Get template sections if preset is selected
const templateSections = computed(() => {
  if (!props.presetId) return []
  const template = getTemplateFromPreset(props.presetId)
  return template?.sections || []
})

// Default colors if no palette selected
const previewColors = computed(() => {
  if (props.palette) {
    return {
      background: props.palette.colors.background,
      primary: props.palette.colors.primary,
      accent: props.palette.colors.accent,
    }
  }
  // Default gray wireframe
  return {
    background: '#f8fafc',
    primary: '#cbd5e1',
    accent: '#94a3b8',
  }
})

// Preview fonts
const previewFonts = computed(() => {
  if (props.fontPairing) {
    return {
      heading: props.fontPairing.fonts.heading,
      body: props.fontPairing.fonts.body,
    }
  }
  return {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  }
})

// Status text for preview
const statusText = computed(() => {
  if (props.projectName) return `Preview: ${props.projectName}`
  if (props.themeName) return `Theme: ${props.themeName}`
  if (props.useCaseName) return `Use Case: ${props.useCaseName}`
  if (props.categoryName) return `Category: ${props.categoryName}`
  return 'Select options to preview'
})

// Helper to determine section wireframe type
function getSectionWireframeType(sectionType: string, variant: string): string {
  return `${sectionType}-${variant}`
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Preview header -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span class="text-sm font-medium text-foreground">{{ statusText }}</span>
      </div>
    </div>

    <!-- Preview container -->
    <div
      class="flex-1 overflow-y-auto p-8 transition-colors duration-500"
      :style="{ backgroundColor: previewColors.background }"
    >
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Render template sections if available -->
        <template v-if="templateSections.length > 0">
          <div
            v-for="(section, index) in templateSections"
            :key="`section-${index}`"
            class="animate-fadeIn"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Hero Section Wireframes -->
            <div
              v-if="section.type === 'hero'"
              class="rounded-xl p-12 transition-all duration-500 border-2 border-dashed"
              :style="{
                borderColor: previewColors.accent,
                backgroundColor: `${previewColors.primary}10`
              }"
            >
              <div class="h-12 rounded-lg mb-4 transition-all duration-500" :style="{ backgroundColor: previewColors.primary, maxWidth: '80%' }" />
              <div class="h-6 rounded-lg mb-8 transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '60%', opacity: 0.6 }" />
              <div class="h-12 w-40 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.accent }" />
            </div>

            <!-- Cards Section Wireframes -->
            <div v-else-if="section.type === 'cards'" class="grid grid-cols-3 gap-4">
              <div
                v-for="i in 3"
                :key="`card-${i}`"
                class="rounded-lg p-6 border-2 border-dashed transition-all duration-500"
                :style="{ borderColor: previewColors.primary }"
              >
                <div class="w-12 h-12 rounded-lg mb-4 transition-all duration-500" :style="{ backgroundColor: previewColors.primary }" />
                <div class="h-4 rounded mb-2 transition-all duration-500" :style="{ backgroundColor: previewColors.accent }" />
                <div class="h-3 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.4, maxWidth: '90%' }" />
              </div>
            </div>

            <!-- Products Section Wireframes -->
            <div v-else-if="section.type === 'products'" class="grid grid-cols-3 gap-4">
              <div
                v-for="i in 3"
                :key="`product-${i}`"
                class="rounded-lg border-2 border-dashed transition-all duration-500 overflow-hidden"
                :style="{ borderColor: previewColors.primary }"
              >
                <div class="aspect-square transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.2 }" />
                <div class="p-4 space-y-2">
                  <div class="h-4 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '80%' }" />
                  <div class="h-3 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.4, maxWidth: '50%' }" />
                </div>
              </div>
            </div>

            <!-- Links Section Wireframes -->
            <div v-else-if="section.type === 'links'" class="space-y-3">
              <div
                v-for="i in 4"
                :key="`link-${i}`"
                class="rounded-lg p-4 border-2 border-dashed transition-all duration-500 flex items-center justify-between"
                :style="{ borderColor: previewColors.primary }"
              >
                <div class="h-4 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.accent, width: '40%' }" />
                <div class="w-4 h-4 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.primary }" />
              </div>
            </div>

            <!-- Contact Section Wireframes -->
            <div v-else-if="section.type === 'contact'" class="rounded-xl p-10 border-2 border-dashed transition-all duration-500" :style="{ borderColor: previewColors.primary }">
              <div class="h-8 rounded-lg mb-6 transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '50%' }" />
              <div class="space-y-4">
                <div class="h-10 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.2 }" />
                <div class="h-10 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.2 }" />
                <div class="h-24 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.2 }" />
                <div class="h-10 w-32 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.accent }" />
              </div>
            </div>

            <!-- Gallery Section Wireframes -->
            <div v-else-if="section.type === 'gallery'" class="grid grid-cols-4 gap-3">
              <div
                v-for="i in 8"
                :key="`gallery-${i}`"
                class="aspect-square rounded-lg transition-all duration-500"
                :style="{ backgroundColor: previewColors.primary, opacity: 0.2 }"
              />
            </div>

            <!-- Accordion Section Wireframes -->
            <div v-else-if="['faq', 'menu', 'events', 'services'].includes(section.type)" class="space-y-3">
              <div
                v-for="i in 4"
                :key="`accordion-${i}`"
                class="rounded-lg p-4 border-2 border-dashed transition-all duration-500"
                :style="{ borderColor: previewColors.primary }"
              >
                <div class="h-4 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '60%' }" />
              </div>
            </div>

            <!-- Generic Section Fallback -->
            <div v-else class="rounded-xl p-10 border-2 border-dashed transition-all duration-500" :style="{ borderColor: previewColors.primary }">
              <div class="h-8 rounded-lg mb-6 transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '50%' }" />
              <div class="space-y-3">
                <div v-for="i in 3" :key="`line-${i}`" class="h-4 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.3 }" />
              </div>
            </div>
          </div>
        </template>

        <!-- Default wireframe when no template selected -->
        <template v-else>
          <!-- Hero wireframe -->
          <div
            class="rounded-xl p-12 transition-all duration-500 border-2 border-dashed"
            :style="{
              borderColor: previewColors.accent,
              backgroundColor: `${previewColors.primary}10`
            }"
          >
            <div class="h-12 rounded-lg mb-4 transition-all duration-500" :style="{ backgroundColor: previewColors.primary, maxWidth: '80%' }" />
            <div class="h-6 rounded-lg mb-8 transition-all duration-500" :style="{ backgroundColor: previewColors.accent, maxWidth: '60%', opacity: 0.6 }" />
            <div class="h-12 w-40 rounded-lg transition-all duration-500" :style="{ backgroundColor: previewColors.accent }" />
          </div>

          <!-- Features wireframe (3 cards) -->
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="i in 3"
              :key="`feature-${i}`"
              class="rounded-lg p-6 border-2 border-dashed transition-all duration-500"
              :style="{ borderColor: previewColors.primary }"
            >
              <div class="w-12 h-12 rounded-lg mb-4 transition-all duration-500" :style="{ backgroundColor: previewColors.primary }" />
              <div class="h-4 rounded mb-2 transition-all duration-500" :style="{ backgroundColor: previewColors.accent }" />
              <div class="h-3 rounded transition-all duration-500" :style="{ backgroundColor: previewColors.primary, opacity: 0.4, maxWidth: '90%' }" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Preview footer -->
    <div class="p-4 border-t border-border bg-muted/30">
      <p class="text-xs text-center text-muted-foreground">
        This is a simplified preview. Your final page will be fully customizable.
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
}
</style>
