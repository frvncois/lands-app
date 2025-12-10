<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { SectionBlockType } from '@/types/editor'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  blocksByCategory,
  categoryLabels,
  presetLabels,
  presetIcons,
  presetTypes,
  type PresetType,
} from '@/lib/editor-utils'
import { Icon } from '@/components/ui'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  selectBlock: [type: SectionBlockType]
  selectPreset: [type: PresetType]
}>()

const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

interface BlockItem {
  id: string
  type: 'block' | 'preset'
  blockType?: SectionBlockType
  presetType?: PresetType
  label: string
  icon: string
  category: string
}

// Build list of all available blocks and presets
const allItems = computed<BlockItem[]>(() => {
  const items: BlockItem[] = []

  // Layout blocks
  for (const blockType of blocksByCategory.layout) {
    items.push({
      id: `block-${blockType}`,
      type: 'block',
      blockType,
      label: sectionBlockLabels[blockType],
      icon: sectionBlockIcons[blockType],
      category: 'Layout',
    })
  }

  // Content blocks
  for (const blockType of blocksByCategory.content) {
    items.push({
      id: `block-${blockType}`,
      type: 'block',
      blockType,
      label: sectionBlockLabels[blockType],
      icon: sectionBlockIcons[blockType],
      category: 'Content',
    })
  }

  // List/Collection presets
  for (const presetType of presetTypes) {
    items.push({
      id: `preset-${presetType}`,
      type: 'preset',
      presetType,
      label: presetLabels[presetType],
      icon: presetIcons[presetType],
      category: 'List / Collection',
    })
  }

  return items
})

// Filter items based on search query
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return allItems.value
  const query = searchQuery.value.toLowerCase()
  return allItems.value.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})

// Group items by category
const groupedItems = computed(() => {
  const groups: Record<string, BlockItem[]> = {}
  for (const item of filteredItems.value) {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    const categoryItems = groups[item.category]
    if (categoryItems) {
      categoryItems.push(item)
    }
  }
  return groups
})

// Category order for consistent display
const categoryOrder = ['Layout', 'Content', 'List / Collection']

const orderedGroups = computed(() => {
  const result: { name: string; items: BlockItem[] }[] = []
  for (const category of categoryOrder) {
    const items = groupedItems.value[category]
    if (items) {
      result.push({ name: category, items })
    }
  }
  return result
})

function close() {
  emit('update:open', false)
  searchQuery.value = ''
  selectedIndex.value = 0
}

function handleSelect(item: BlockItem) {
  if (item.type === 'block' && item.blockType) {
    emit('selectBlock', item.blockType)
  } else if (item.type === 'preset' && item.presetType) {
    emit('selectPreset', item.presetType)
  }
  close()
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1)
      scrollSelectedIntoView()
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      scrollSelectedIntoView()
      break
    case 'Enter':
      event.preventDefault()
      const selectedItem = filteredItems.value[selectedIndex.value]
      if (selectedItem) {
        handleSelect(selectedItem)
      }
      break
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

function scrollSelectedIntoView() {
  nextTick(() => {
    const selectedEl = containerRef.value?.querySelector('[data-selected="true"]')
    selectedEl?.scrollIntoView({ block: 'nearest' })
  })
}

// Reset selection when search changes
watch(searchQuery, () => {
  selectedIndex.value = 0
})

// Focus input when opened
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    inputRef.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="close"
        />

        <!-- Command Dialog -->
        <Transition
          enter-active-class="duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
        >
          <div
            v-if="open"
            class="relative bg-popover backdrop-blur-xl border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <!-- Search Input -->
            <div class="flex items-center gap-3 px-4 border-b border-border">
              <Icon name="search-1" class="text-muted-foreground" />
              <input
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Search blocks..."
                class="flex-1 h-11 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
                ESC
              </kbd>
            </div>

            <!-- Results -->
            <div ref="containerRef" class="max-h-80 overflow-y-auto p-2">
              <div v-if="filteredItems.length === 0" class="py-8 text-center">
                <p class="text-sm text-muted-foreground">No blocks found.</p>
              </div>

              <template v-else>
                <div
                  v-for="group in orderedGroups"
                  :key="group.name"
                  class="mb-2 last:mb-0"
                >
                  <p class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {{ group.name }}
                  </p>
                  <div class="space-y-0.5">
                    <button
                      v-for="item in group.items"
                      :key="item.id"
                      :data-selected="filteredItems.indexOf(item) === selectedIndex"
                      class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors"
                      :class="filteredItems.indexOf(item) === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent/50'"
                      @click="handleSelect(item)"
                      @mouseenter="selectedIndex = filteredItems.indexOf(item)"
                    >
                      <div class="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Icon :name="item.icon" :size="16" class="text-muted-foreground" />
                      </div>
                      <span class="flex-1">{{ item.label }}</span>
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30">
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <kbd class="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                  <Icon name="arrow-up" class="text-[8px]" />
                </kbd>
                <kbd class="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                  <Icon name="arrow-down" class="text-[8px]" />
                </kbd>
                <span>Navigate</span>
              </div>
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                  Enter
                </kbd>
                <span>Select</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
