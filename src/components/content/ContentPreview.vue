<script setup lang="ts">
import { ref, computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import PreviewSection from '@/components/preview/PreviewSection.vue'
import SelectionOverlay from '@/components/preview/SelectionOverlay.vue'
import { READONLY_MODE_KEY, CONTENT_PREVIEW_MODE_KEY } from '@/components/preview/injection-keys'

const designerStore = useDesignerStore()

// Ref for the scroll container
const scrollContainerRef = ref<HTMLElement | null>(null)

// Provide readonly mode to disable selection, drag-drop in preview
// Note: contenteditable editing is still allowed via CONTENT_PREVIEW_MODE_KEY
provide(READONLY_MODE_KEY, true)
// Enable content preview mode to show hover outlines on editable blocks and allow inline editing
provide(CONTENT_PREVIEW_MODE_KEY, true)

// ============================================
// DESELECT HANDLING
// ============================================

// Click on empty area to deselect
function handlePreviewClick(event: MouseEvent) {
  // Deselect if clicking on empty preview area (not on a block)
  const target = event.target as HTMLElement
  const isOnBlock = target.closest('[data-preview-block]')
  if (!isOnBlock) {
    designerStore.selectBlock(null)
    // Also blur any focused contenteditable
    const activeEl = document.activeElement as HTMLElement
    if (activeEl?.getAttribute('contenteditable') === 'true') {
      activeEl.blur()
    }
  }
}

// ESC key to deselect and blur
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    // Blur any focused contenteditable first
    const activeEl = document.activeElement as HTMLElement
    if (activeEl?.getAttribute('contenteditable') === 'true') {
      activeEl.blur()
    }
    // Deselect the block
    designerStore.selectBlock(null)
  }
}

// ============================================
// FONT LOADING (same as DesignerPreview)
// ============================================

// Custom font loading
const loadedFontStyleElement = ref<HTMLStyleElement | null>(null)

function loadCustomFonts() {
  const customFonts = designerStore.pageSettings.customFonts || []

  // Remove existing style element if any
  if (loadedFontStyleElement.value) {
    loadedFontStyleElement.value.remove()
    loadedFontStyleElement.value = null
  }

  if (customFonts.length === 0) return

  // Create @font-face rules for each custom font
  const fontFaceRules = customFonts.map((font: { name: string; url: string }) => {
    return `@font-face {
      font-family: '${font.name}';
      src: url('${font.url}');
      font-display: swap;
    }`
  }).join('\n')

  // Create and inject style element
  const styleEl = document.createElement('style')
  styleEl.textContent = fontFaceRules
  document.head.appendChild(styleEl)
  loadedFontStyleElement.value = styleEl
}

// Google Fonts loading
const loadedGoogleFontsLink = ref<HTMLLinkElement | null>(null)

function loadGoogleFonts() {
  const googleFonts = designerStore.pageSettings.googleFonts || []

  // Remove existing link element if any
  if (loadedGoogleFontsLink.value) {
    loadedGoogleFontsLink.value.remove()
    loadedGoogleFontsLink.value = null
  }

  if (googleFonts.length === 0) return

  // Build Google Fonts URL with all selected fonts
  const fontFamilies = googleFonts.map((font: { family: string }) => {
    const encoded = encodeURIComponent(font.family)
    return `family=${encoded}:wght@400;500;600;700`
  }).join('&')

  const url = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`

  // Create and inject link element
  const linkEl = document.createElement('link')
  linkEl.rel = 'stylesheet'
  linkEl.href = url
  document.head.appendChild(linkEl)
  loadedGoogleFontsLink.value = linkEl
}

// Watch for custom font changes (compare serialized to avoid deep watch overhead)
const customFontsKey = computed(() =>
  JSON.stringify((designerStore.pageSettings.customFonts || []).map((f: { name: string; url: string }) => `${f.name}:${f.url}`))
)
watch(customFontsKey, () => loadCustomFonts())

// Watch for Google font changes (compare serialized to avoid deep watch overhead)
const googleFontsKey = computed(() =>
  JSON.stringify((designerStore.pageSettings.googleFonts || []).map((f: { family: string }) => f.family))
)
watch(googleFontsKey, () => loadGoogleFonts())

// Load fonts on mount and add keyboard listener
onMounted(() => {
  loadCustomFonts()
  loadGoogleFonts()
  document.addEventListener('keydown', handleKeyDown)
})

// Cleanup on unmount
onUnmounted(() => {
  if (loadedFontStyleElement.value) {
    loadedFontStyleElement.value.remove()
  }
  if (loadedGoogleFontsLink.value) {
    loadedGoogleFontsLink.value.remove()
  }
  document.removeEventListener('keydown', handleKeyDown)
})

// ============================================
// PAGE STYLES
// ============================================

// Page styles from settings (matching DesignerPreview)
const pageStyles = computed(() => {
  const settings = designerStore.pageSettings
  const styles: Record<string, string> = {}

  // Max width
  if (settings.maxWidth && settings.maxWidth !== 'none') {
    styles.maxWidth = `${settings.maxWidth}px`
  }

  // Background color
  if (settings.backgroundColor) {
    styles.backgroundColor = settings.backgroundColor
  }

  // Background image
  if (settings.backgroundImage) {
    styles.backgroundImage = `url(${settings.backgroundImage})`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
  }

  // Text color
  if (settings.textColor) {
    styles.color = settings.textColor
  }

  // Font family
  if (settings.fontFamily) {
    styles.fontFamily = settings.fontFamily
  }

  // Base font size
  if (settings.baseFontSize) {
    styles.fontSize = `${settings.baseFontSize}px`
  }

  return styles
})
</script>

<template>
  <!-- clip-path creates containing block for fixed elements without breaking scroll -->
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-muted/30" style="clip-path: inset(0);">
    <!-- Preview area wrapper (relative for overlay positioning) -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Scroll container -->
      <div
        ref="scrollContainerRef"
        class="absolute inset-0 overflow-auto [&>*]:min-h-full"
        @click="handlePreviewClick"
      >
        <!-- Viewport container - responds to viewport toggle -->
        <div
          class="h-full mx-auto transition-all duration-300"
          :style="{ maxWidth: designerStore.viewportWidth, '--designer-vh': 'calc((100vh - 3.5rem) / 100)' }"
        >
          <!-- Page container with settings applied -->
          <div
            class="lands-preview designer-preview-container bg-background min-h-full transition-all duration-300"
            :style="pageStyles"
          >
            <!-- Empty state -->
            <div
              v-if="designerStore.blocks.length === 0"
              class="flex flex-col items-center justify-center h-96 text-center px-4"
            >
              <div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm text-muted-foreground">No blocks yet</p>
              <p class="text-xs text-muted-foreground mt-1">Add content in the Designer</p>
            </div>

            <!-- Section blocks -->
            <template v-else>
              <PreviewSection
                v-for="(block, index) in designerStore.blocks"
                :key="block.id"
                :block="block"
                :index="index"
                :total="designerStore.blocks.length"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Selection Overlay (rendered outside content flow to avoid overflow:hidden clipping) -->
      <SelectionOverlay :scroll-container="scrollContainerRef" />
    </div>
  </div>
</template>
