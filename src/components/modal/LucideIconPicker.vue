<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui'
import Icon from '@/components/ui/Icon.vue'
import {
  icons,
  allLucideIconNames,
  searchLucideIcons,
  iconCategories,
  getIconsByCategory,
  formatIconName,
  popularIcons,
} from '@/lib/lucide-icons'

const props = defineProps<{
  open: boolean
  selectedIcon?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [iconName: string]
}>()

// State
const searchQuery = ref('')
const selectedCategory = ref<string>('popular')
const localSelectedIcon = ref<string | null>(null)
const visibleCount = ref(120) // Start with 120 icons, load more on scroll

// Categories for filter
const categories = [
  { value: 'popular', label: 'Popular' },
  { value: 'all', label: 'All Icons' },
  ...iconCategories.map(c => ({ value: c.id, label: c.label })),
]

// Filtered icons based on search and category
const filteredIcons = computed(() => {
  let result: string[]

  // If searching, search across all icons
  if (searchQuery.value.trim()) {
    result = searchLucideIcons(searchQuery.value)
  } else if (selectedCategory.value === 'popular') {
    result = popularIcons
  } else {
    result = getIconsByCategory(selectedCategory.value)
  }

  return result
})

// Visible icons (with lazy loading)
const visibleIcons = computed(() => {
  return filteredIcons.value.slice(0, visibleCount.value)
})

// Has more icons to load
const hasMore = computed(() => {
  return visibleCount.value < filteredIcons.value.length
})

// Load more icons on scroll
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // Load more when near bottom (within 200px)
  if (scrollHeight - scrollTop - clientHeight < 200 && hasMore.value) {
    visibleCount.value += 80
  }
}

// Check if icon is selected
function isIconSelected(iconName: string): boolean {
  return localSelectedIcon.value === iconName
}

// Select an icon
function selectIcon(iconName: string) {
  localSelectedIcon.value = iconName
}

// Close modal
function close() {
  emit('update:open', false)
}

// Confirm selection
function confirm() {
  if (localSelectedIcon.value) {
    emit('select', localSelectedIcon.value)
  }
  close()
}

// Initialize local state from props
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    localSelectedIcon.value = props.selectedIcon || null
    searchQuery.value = ''
    selectedCategory.value = props.selectedIcon ? 'all' : 'popular'
    visibleCount.value = 120
  }
}, { immediate: true })

// Reset visible count when filters change
watch([searchQuery, selectedCategory], () => {
  visibleCount.value = 120
})

// Get icon component
function getIcon(name: string) {
  return icons[name]
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
      <div class="relative bg-card border border-border rounded-4xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 class="text-2xl font-semibold text-foreground">Select Icon</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Choose from {{ allLucideIconNames.length.toLocaleString() }} icons
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
              placeholder="Search icons..."
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

        <!-- Results count -->
        <div class="px-4 py-2 bg-muted/20 border-b border-border">
          <span class="text-xs text-muted-foreground">
            {{ filteredIcons.length.toLocaleString() }} icon{{ filteredIcons.length === 1 ? '' : 's' }}
            <template v-if="localSelectedIcon">
              &middot; Selected: <span class="text-foreground font-medium">{{ formatIconName(localSelectedIcon) }}</span>
            </template>
          </span>
        </div>

        <!-- Icon grid -->
        <div
          class="flex-1 overflow-y-auto p-4"
          @scroll="handleScroll"
        >
          <!-- No results -->
          <div v-if="filteredIcons.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="search-1" class="text-3xl text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">No icons found</p>
          </div>

          <!-- Icon grid -->
          <div v-else class="grid grid-cols-8 gap-2">
            <button
              v-for="iconName in visibleIcons"
              :key="iconName"
              class="relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-muted/50 group"
              :class="isIconSelected(iconName) ? 'border-primary bg-primary/10' : 'border-transparent'"
              :title="formatIconName(iconName)"
              @click="selectIcon(iconName)"
              @dblclick="selectIcon(iconName); confirm()"
            >
              <!-- Icon -->
              <component
                :is="getIcon(iconName)"
                class="w-6 h-6 text-foreground"
              />
              <!-- Name tooltip on hover -->
              <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {{ formatIconName(iconName) }}
              </span>
              <!-- Selection indicator -->
              <div
                v-if="isIconSelected(iconName)"
                class="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
              >
                <svg class="w-2.5 h-2.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Load more indicator -->
          <div v-if="hasMore" class="flex items-center justify-center py-4 mt-4">
            <span class="text-xs text-muted-foreground">
              Showing {{ visibleIcons.length }} of {{ filteredIcons.length }} icons &middot; Scroll for more
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 p-4 border-t border-border bg-muted/30">
          <span class="text-xs text-muted-foreground">
            Double-click to select quickly
          </span>
          <div class="flex items-center gap-3">
            <Button variant="ghost" @click="close">
              Cancel
            </Button>
            <Button :disabled="!localSelectedIcon" @click="confirm">
              Select Icon
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
