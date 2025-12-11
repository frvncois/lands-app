<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { SectionBlockType, BlockCategory } from '@/types/editor'
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
import { Button, Icon } from '@/components/ui'

export type BlockPickerMode = 'all' | 'nested' | 'content-only' | 'form-fields' | 'header-footer-stack'

interface Props {
  mode?: BlockPickerMode
  triggerLabel?: string
  triggerIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'all',
  triggerLabel: 'Add block',
  triggerIcon: 'plus',
})

const emit = defineEmits<{
  select: [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Categories to show based on mode
const categories = computed<BlockCategory[]>(() => {
  switch (props.mode) {
    case 'content-only':
    case 'header-footer-stack':
      return ['content']
    case 'nested':
      return ['layout', 'content'] // Stack shown under layout
    default:
      return ['layout', 'content']
  }
})

// Get available block types based on mode
const availableBlockTypes = computed(() => {
  switch (props.mode) {
    case 'header-footer-stack':
      return ['button', 'text', 'image'] as SectionBlockType[]
    case 'content-only':
      return blocksByCategory.content
    case 'nested':
      // Only Stack from layout, plus all content blocks
      return ['stack', ...blocksByCategory.content] as SectionBlockType[]
    default:
      return [...blocksByCategory.layout, ...blocksByCategory.content]
  }
})

// Show presets based on mode
const showPresets = computed(() => {
  return props.mode === 'all' || props.mode === 'nested'
})

// Filtered blocks by search query
const filteredBlocksByCategory = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const result: Record<BlockCategory, SectionBlockType[]> = { layout: [], content: [] }

  for (const category of categories.value) {
    const types = (blocksByCategory[category] || []).filter(type =>
      availableBlockTypes.value.includes(type) &&
      (!query || sectionBlockLabels[type].toLowerCase().includes(query))
    )
    result[category] = types
  }
  return result
})

// Filtered presets by search query
const filteredPresetTypes = computed(() => {
  if (!showPresets.value) return []
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return presetTypes
  return presetTypes.filter(preset =>
    presetLabels[preset].toLowerCase().includes(query)
  )
})

// Check if there are any results
const hasSearchResults = computed(() => {
  return filteredBlocksByCategory.value.layout.length > 0 ||
         filteredBlocksByCategory.value.content.length > 0 ||
         filteredPresetTypes.value.length > 0
})

function updatePosition() {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = 400 // approximate max height

  // Position to the right of the trigger
  let top = rect.top
  const left = rect.right + 8

  // Adjust if dropdown would go below viewport
  if (top + dropdownHeight > viewportHeight - 16) {
    top = Math.max(16, viewportHeight - dropdownHeight - 16)
  }

  dropdownPosition.value = { top, left }
}

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function open() {
  updatePosition()
  isOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function handleSelect(value: string) {
  emit('select', value)
  close()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(target) &&
    triggerRef.value &&
    !triggerRef.value.contains(target)
  ) {
    close()
  }
}

// Watch for open state to focus search
watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    searchInputRef.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <div ref="triggerRef">
    <Button
      variant="dotted"
      size="sm"
      full-width
      class="justify-start text-muted-foreground"
      @click.stop="toggle"
    >
      <Icon :name="triggerIcon" class="text-xs" />
      <span class="text-[10px]">{{ triggerLabel }}</span>
    </Button>
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-50 w-64 bg-popover backdrop-blur-xl border border-border rounded-2xl shadow-lg max-h-[70vh] overflow-hidden flex flex-col origin-top-left"
        :style="{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }"
      >
        <!-- Search input -->
        <div class="p-2 border-b border-border">
          <div class="relative">
            <Icon name="search-1" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search blocks..."
              class="w-full h-8 pl-7 pr-3 text-xs bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              @keydown.esc="close"
            />
          </div>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-3">
          <!-- No results message -->
          <div v-if="!hasSearchResults" class="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="search-1" class="text-2xl text-muted-foreground/50 mb-2" />
            <p class="text-xs text-muted-foreground">No blocks found</p>
          </div>

          <template v-else>
            <!-- Block categories -->
            <template v-for="category in categories" :key="category">
              <div v-if="filteredBlocksByCategory[category].length > 0" class="flex flex-col items-start mb-3.5">
                <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                  {{ categoryLabels[category] }}
                </div>
                <div class="grid grid-cols-2 gap-1 w-full">
                  <button
                    v-for="type in filteredBlocksByCategory[category]"
                    :key="type"
                    class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-grab active:cursor-grabbing"
                    @click="handleSelect(type)"
                  >
                    <Icon :name="sectionBlockIcons[type]" :size="18" class="text-muted-foreground" />
                    <span class="text-[10px] text-center leading-tight">{{ sectionBlockLabels[type] }}</span>
                  </button>
                </div>
              </div>
            </template>

            <!-- List / Collection presets -->
            <div v-if="filteredPresetTypes.length > 0" class="flex flex-col items-start">
              <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                List / Collection
              </div>
              <div class="grid grid-cols-2 gap-1 w-full">
                <button
                  v-for="preset in filteredPresetTypes"
                  :key="preset"
                  class="flex flex-col items-center gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent transition-colors"
                  @click="handleSelect(preset)"
                >
                  <Icon :name="presetIcons[preset]" :size="18" class="text-muted-foreground" />
                  <span class="text-[10px] text-center leading-tight">{{ presetLabels[preset] }}</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
