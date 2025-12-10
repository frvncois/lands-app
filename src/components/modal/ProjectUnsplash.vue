<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { Button, Spinner } from '@/components/ui'
import Icon from '@/components/ui/Icon.vue'

interface UnsplashPhoto {
  id: string
  width: number
  height: number
  color: string
  description: string
  urls: {
    thumb: string
    small: string
    regular: string
    full: string
  }
  user: {
    name: string
    username: string
    link: string
  }
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [url: string, attribution: { name: string; username: string; link: string }]
}>()

// State
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const photos = ref<UnsplashPhoto[]>([])
const searchQuery = ref('')
const searchInput = ref('')
const selectedOrientation = ref<string>('')
const currentPage = ref(1)
const totalPages = ref(0)
const selectedPhoto = ref<UnsplashPhoto | null>(null)

// Orientation options
const orientations = [
  { value: '', label: 'All' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'squarish', label: 'Square' },
]

// Search photos from Unsplash via Edge Function
async function searchPhotos(page = 1, append = false) {
  if (!searchQuery.value.trim()) return

  if (append) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
    photos.value = []
  }
  error.value = null

  try {
    const { data, error: fnError } = await supabase.functions.invoke('unsplash-search', {
      body: {
        query: searchQuery.value.trim(),
        page,
        per_page: 30,
        orientation: selectedOrientation.value || undefined,
      },
    })

    if (fnError) throw fnError

    if (append) {
      photos.value = [...photos.value, ...data.photos]
    } else {
      photos.value = data.photos || []
    }
    totalPages.value = data.total_pages
    currentPage.value = page
  } catch (e: any) {
    console.error('Failed to search Unsplash:', e)
    error.value = e.message || 'Failed to search images'
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Handle search submit
function handleSearch() {
  searchQuery.value = searchInput.value
  currentPage.value = 1
  searchPhotos(1)
}

// Load more photos
function loadMore() {
  if (currentPage.value < totalPages.value) {
    searchPhotos(currentPage.value + 1, true)
  }
}

// Select a photo
function selectPhoto(photo: UnsplashPhoto) {
  selectedPhoto.value = photo
}

// Confirm selection
function confirmSelection() {
  if (!selectedPhoto.value) return

  emit('select', selectedPhoto.value.urls.regular, {
    name: selectedPhoto.value.user.name,
    username: selectedPhoto.value.user.username,
    link: selectedPhoto.value.user.link,
  })
  close()
}

// Close modal
function close() {
  emit('update:open', false)
  selectedPhoto.value = null
}

// Reset state when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    searchInput.value = ''
    searchQuery.value = ''
    selectedOrientation.value = ''
    photos.value = []
    selectedPhoto.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 0
  }
})

// Re-search when orientation changes (if there's already a query)
watch(selectedOrientation, () => {
  if (searchQuery.value) {
    searchPhotos(1)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-md"
        @click="close"
      ></div>

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-4xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 class="text-2xl font-semibold text-foreground">Find Image</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Search millions of free photos from Unsplash
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

        <!-- Search bar -->
        <div class="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
          <!-- Search input -->
          <form class="flex-1 relative" @submit.prevent="handleSearch">
            <Icon name="search-1" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search for images..."
              class="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              @keydown.enter="handleSearch"
            />
          </form>

          <!-- Orientation filter -->
          <select
            v-model="selectedOrientation"
            class="h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option v-for="opt in orientations" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <!-- Search button -->
          <Button @click="handleSearch" :disabled="!searchInput.trim() || isLoading">
            Search
          </Button>
        </div>

        <!-- Photo grid -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Initial state -->
          <div v-if="!searchQuery && !isLoading" class="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="photos" class="text-4xl text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Search for beautiful free photos</p>
            <p class="text-xs text-muted-foreground mt-1">Try "nature", "office", "technology", etc.</p>
          </div>

          <!-- Loading -->
          <div v-else-if="isLoading" class="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="warning" class="text-3xl text-destructive mb-2" />
            <p class="text-sm text-muted-foreground">{{ error }}</p>
            <Button variant="outline" size="sm" class="mt-4" @click="handleSearch">
              Try again
            </Button>
          </div>

          <!-- No results -->
          <div v-else-if="photos.length === 0 && searchQuery" class="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="search-1" class="text-3xl text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">No images found for "{{ searchQuery }}"</p>
            <p class="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>

          <!-- Photo grid -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="photo in photos"
                :key="photo.id"
                class="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer transition-all border-2"
                :class="selectedPhoto?.id === photo.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'"
                :style="{ backgroundColor: photo.color }"
                @click="selectPhoto(photo)"
              >
                <img
                  :src="photo.urls.small"
                  :alt="photo.description"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <!-- Hover overlay with attribution -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p class="text-white text-xs truncate">
                    Photo by <span class="font-medium">{{ photo.user.name }}</span>
                  </p>
                </div>
                <!-- Selection indicator -->
                <div
                  v-if="selectedPhoto?.id === photo.id"
                  class="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Load more button -->
            <div v-if="currentPage < totalPages" class="flex justify-center pt-2">
              <Button
                variant="outline"
                :disabled="isLoadingMore"
                @click="loadMore"
              >
                <Spinner v-if="isLoadingMore" size="sm" class="mr-2" />
                Load more
              </Button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p class="text-xs text-muted-foreground">
            Photos provided by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">Unsplash</a>
          </p>
          <div class="flex items-center gap-3">
            <Button variant="ghost" @click="close">
              Cancel
            </Button>
            <Button :disabled="!selectedPhoto" @click="confirmSelection">
              Use this image
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
