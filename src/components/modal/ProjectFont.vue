<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { GoogleFont } from '@/types/designer'
import { Button, Input, Spinner } from '@/components/ui'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{
  open: boolean
  selectedFonts: GoogleFont[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:selectedFonts': [fonts: GoogleFont[]]
}>()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const fonts = ref<GoogleFont[]>([])
const searchQuery = ref('')
const selectedCategory = ref<string>('')
const localSelectedFonts = ref<GoogleFont[]>([])

// Categories
const categories = [
  { value: '', label: 'All Categories' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handwriting' },
  { value: 'monospace', label: 'Monospace' },
]

// Filtered fonts
const filteredFonts = computed(() => {
  let result = fonts.value

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((font: GoogleFont) =>
      font.family.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter((font: GoogleFont) => font.category === selectedCategory.value)
  }

  return result
})

// Check if font is selected
function isFontSelected(font: GoogleFont): boolean {
  return localSelectedFonts.value.some((f: GoogleFont) => f.family === font.family)
}

// Toggle font selection
function toggleFont(font: GoogleFont) {
  const index = localSelectedFonts.value.findIndex((f: GoogleFont) => f.family === font.family)
  if (index >= 0) {
    localSelectedFonts.value.splice(index, 1)
  } else {
    localSelectedFonts.value.push(font)
  }
}

// Load Google Font stylesheet for preview
function getFontPreviewUrl(fontFamily: string): string {
  const encoded = encodeURIComponent(fontFamily)
  return `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`
}

// Fetch fonts from Edge Function
async function fetchFonts() {
  isLoading.value = true
  error.value = null

  try {
    const { data, error: fnError } = await supabase.functions.invoke('google-fonts', {
      body: {},
    })

    if (fnError) throw fnError

    fonts.value = data.fonts || []
  } catch (e: any) {
    console.error('Failed to fetch Google Fonts:', e)
    error.value = e.message || 'Failed to load fonts'
  } finally {
    isLoading.value = false
  }
}

// Close modal
function close() {
  emit('update:open', false)
}

// Save and close
function save() {
  emit('update:selectedFonts', [...localSelectedFonts.value])
  close()
}

// Initialize local state from props
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    localSelectedFonts.value = [...props.selectedFonts]
    searchQuery.value = ''
    selectedCategory.value = ''
    if (fonts.value.length === 0) {
      fetchFonts()
    }
  }
}, { immediate: true })

// Load font stylesheets for selected fonts
const loadedFonts = ref<Set<string>>(new Set())

function loadFontPreview(fontFamily: string) {
  if (loadedFonts.value.has(fontFamily)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = getFontPreviewUrl(fontFamily)
  document.head.appendChild(link)
  loadedFonts.value.add(fontFamily)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-md"
        @click="close"
      ></div>

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-4xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 class="text-2xl font-semibold text-foreground">Google Fonts</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Select fonts to add to your project
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            @click="close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
          <!-- Search -->
          <div class="flex-1 relative">
            <Icon name="search-1" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search fonts..."
              class="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- Category filter -->
          <select
            v-model="selectedCategory"
            class="h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Selected count -->
        <div v-if="localSelectedFonts.length > 0" class="px-4 py-2 bg-primary/5 border-b border-border">
          <span class="text-sm text-primary font-medium">
            {{ localSelectedFonts.length }} font{{ localSelectedFonts.length === 1 ? '' : 's' }} selected
          </span>
        </div>

        <!-- Font list -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="warning" class="text-3xl text-destructive mb-2" />
            <p class="text-sm text-muted-foreground">{{ error }}</p>
            <Button variant="outline" size="sm" class="mt-4" @click="fetchFonts">
              Try again
            </Button>
          </div>

          <!-- No results -->
          <div v-else-if="filteredFonts.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="search-1" class="text-3xl text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">No fonts found</p>
          </div>

          <!-- Font grid -->
          <div v-else class="grid grid-cols-2 gap-3">
            <button
              v-for="font in filteredFonts"
              :key="font.family"
              class="relative flex flex-col p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50"
              :class="isFontSelected(font) ? 'border-primary bg-primary/5' : 'border-border'"
              @click="toggleFont(font)"
              @mouseenter="loadFontPreview(font.family)"
            >
              <!-- Font preview -->
              <span
                class="text-xl mb-2 truncate w-full"
                :style="{ fontFamily: `'${font.family}', ${font.category}` }"
              >
                {{ font.family }}
              </span>
              <!-- Font info -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 bg-muted rounded">
                  {{ font.category }}
                </span>
                <span class="text-[10px] text-muted-foreground">
                  {{ font.variants.length }} style{{ font.variants.length === 1 ? '' : 's' }}
                </span>
              </div>
              <!-- Selection indicator -->
              <div
                v-if="isFontSelected(font)"
                class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
          <Button variant="ghost" @click="close">
            Cancel
          </Button>
          <Button @click="save">
            Add {{ localSelectedFonts.length }} Font{{ localSelectedFonts.length === 1 ? '' : 's' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
