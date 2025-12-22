<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { SectionBlockType, BlockCategory } from '@/types/designer'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  blocksByCategory,
  categoryLabels,
  formChildBlockTypes,
} from '@/lib/designer-utils'
import { listPresetConfigs, type ListPresetType } from '@/lib/list-presets'
import { Button, Icon } from '@/components/ui'

// Extended category type to include form
type ExtendedBlockCategory = BlockCategory | 'form'

export type BlockPickerMode = 'all' | 'nested' | 'content-only' | 'header-footer-stack'

export type TriggerVariant = 'button' | 'inline'

interface Props {
  mode?: BlockPickerMode
  triggerLabel?: string
  triggerIcon?: string
  autoOpen?: boolean
  /** External open control - use v-model:open */
  open?: boolean
  /** Custom anchor position for dropdown (instead of trigger-relative) */
  anchorPosition?: { x: number; y: number }
  /** Hide the trigger button (use with v-model:open for programmatic control) */
  hideTrigger?: boolean
  /** Restrict to specific block types (overrides mode filtering) */
  allowedTypes?: string[]
  /** Trigger style variant: 'button' (default) or 'inline' (divider with + icon) */
  triggerVariant?: TriggerVariant
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'all',
  triggerLabel: 'Add block',
  triggerIcon: 'plus',
  autoOpen: false,
  open: undefined,
  anchorPosition: undefined,
  hideTrigger: false,
  allowedTypes: undefined,
  triggerVariant: 'button',
})

const emit = defineEmits<{
  select: [value: string]
  selectListPreset: [type: ListPresetType]
  close: []
  'update:open': [value: boolean]
}>()

// Use internal state or external control
const internalOpen = ref(false)
const isOpen = computed({
  get: () => props.open !== undefined ? props.open : internalOpen.value,
  set: (value: boolean) => {
    if (props.open !== undefined) {
      emit('update:open', value)
    } else {
      internalOpen.value = value
    }
  }
})

const searchQuery = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Extended category labels
const extendedCategoryLabels: Record<ExtendedBlockCategory, string> = {
  ...categoryLabels,
  form: 'Form Fields',
}

// Check if allowed types include form child blocks
const hasFormBlocks = computed(() => {
  if (!props.allowedTypes) return false
  return props.allowedTypes.some(type => formChildBlockTypes.includes(type as any))
})

// Categories to show based on mode
const categories = computed<ExtendedBlockCategory[]>(() => {
  // If allowedTypes includes form blocks, add form category
  if (hasFormBlocks.value) {
    return ['form', 'layout', 'content']
  }

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

// Get available block types based on mode or allowedTypes prop
const availableBlockTypes = computed(() => {
  // If allowedTypes is provided, use it directly
  if (props.allowedTypes && props.allowedTypes.length > 0) {
    return props.allowedTypes as SectionBlockType[]
  }

  switch (props.mode) {
    case 'header-footer-stack':
      return ['button', 'text', 'image'] as SectionBlockType[]
    case 'content-only':
      return blocksByCategory.content
    case 'nested':
      // All layout blocks (stack, grid, canvas, form) plus all content blocks
      return [...blocksByCategory.layout, ...blocksByCategory.content] as SectionBlockType[]
    default:
      return [...blocksByCategory.layout, ...blocksByCategory.content]
  }
})

// Filtered blocks by search query
const filteredBlocksByCategory = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const result: Record<ExtendedBlockCategory, SectionBlockType[]> = { layout: [], content: [], form: [] }

  for (const category of categories.value) {
    let categoryTypes: SectionBlockType[]

    if (category === 'form') {
      // Form category contains form child blocks
      categoryTypes = formChildBlockTypes as SectionBlockType[]
    } else {
      categoryTypes = blocksByCategory[category as BlockCategory] || []
    }

    const types = categoryTypes.filter(type =>
      availableBlockTypes.value.includes(type) &&
      (!query || getBlockLabel(type).toLowerCase().includes(query))
    )
    result[category] = types
  }
  return result
})

// Filtered list presets (show in 'all' and 'nested' modes)
const filteredListPresets = computed(() => {
  // Only show list presets in 'all' and 'nested' modes (not content-only or header-footer-stack)
  if (props.mode !== 'all' && props.mode !== 'nested') return []
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return listPresetConfigs
  return listPresetConfigs.filter(preset =>
    preset.name.toLowerCase().includes(query) ||
    preset.description.toLowerCase().includes(query)
  )
})

// Get the display label for a block type
function getBlockLabel(type: SectionBlockType): string {
  return sectionBlockLabels[type]
}

// Check if there are any results
const hasSearchResults = computed(() => {
  return filteredBlocksByCategory.value.layout.length > 0 ||
         filteredBlocksByCategory.value.content.length > 0 ||
         filteredBlocksByCategory.value.form.length > 0 ||
         filteredListPresets.value.length > 0
})

function updatePosition() {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const dropdownWidth = 256 // w-64 = 16rem = 256px
  const dropdownHeight = 400 // approximate max height

  let top: number
  let left: number

  // Use custom anchor position if provided
  if (props.anchorPosition) {
    top = props.anchorPosition.y
    left = props.anchorPosition.x
  } else if (triggerRef.value) {
    // Position relative to trigger
    const rect = triggerRef.value.getBoundingClientRect()
    top = rect.top
    left = rect.right + 8
  } else {
    // Center in viewport if no trigger or anchor
    top = (viewportHeight - dropdownHeight) / 2
    left = (viewportWidth - dropdownWidth) / 2
  }

  // Adjust if dropdown would go below viewport
  if (top + dropdownHeight > viewportHeight - 16) {
    top = Math.max(16, viewportHeight - dropdownHeight - 16)
  }

  // Adjust if dropdown would go off right edge
  if (left + dropdownWidth > viewportWidth - 16) {
    left = Math.max(16, viewportWidth - dropdownWidth - 16)
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
  emit('close')
}

function handleSelect(value: string) {
  emit('select', value)
  close()
}

function handleListPresetSelect(type: ListPresetType) {
  emit('selectListPreset', type)
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return
  const target = event.target as Node
  // Close if clicking outside dropdown (and outside trigger if it exists)
  const isOutsideDropdown = dropdownRef.value && !dropdownRef.value.contains(target)
  const isOutsideTrigger = !triggerRef.value || !triggerRef.value.contains(target)
  if (isOutsideDropdown && isOutsideTrigger) {
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
  // Use capture phase to catch clicks before they're stopped by stopPropagation
  document.addEventListener('mousedown', handleClickOutside, true)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)

  // Auto-open if prop is set
  if (props.autoOpen) {
    nextTick(() => {
      open()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside, true)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <!-- Button trigger variant (default) -->
  <div v-if="!hideTrigger && !autoOpen && triggerVariant === 'button'" ref="triggerRef">
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

  <!-- Inline trigger variant (divider with + icon) -->
  <div
    v-if="!hideTrigger && !autoOpen && triggerVariant === 'inline'"
    ref="triggerRef"
    class="flex items-center gap-1.5 py-1 mt-0.5 group/inline-add cursor-pointer"
    @click.stop="toggle"
  >
    <div class="flex-1 h-px bg-border/50 group-hover/inline-add:bg-border transition-colors" />
    <div class="flex items-center justify-center w-4 h-4 rounded-full border border-border/50 bg-background group-hover/inline-add:border-primary/50 group-hover/inline-add:bg-primary/10 transition-colors">
      <Icon name="plus" class="text-[8px] text-muted-foreground group-hover/inline-add:text-primary transition-colors" />
    </div>
    <div class="flex-1 h-px bg-border/50 group-hover/inline-add:bg-border transition-colors" />
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
                  {{ extendedCategoryLabels[category] }}
                </div>
                <div class="grid grid-cols-2 gap-1 w-full">
                  <button
                    v-for="type in filteredBlocksByCategory[category]"
                    :key="type"
                    class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-grab active:cursor-grabbing"
                    @click="handleSelect(type)"
                  >
                    <Icon :name="sectionBlockIcons[type]" :size="18" class="text-muted-foreground" />
                    <span class="text-[10px] text-center leading-tight">{{ getBlockLabel(type) }}</span>
                  </button>
                </div>
              </div>
            </template>

            <!-- Lists & Collections -->
            <div v-if="filteredListPresets.length > 0" class="flex flex-col items-start mb-3.5">
              <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                Lists
              </div>
              <div class="grid grid-cols-2 gap-1 w-full">
                <button
                  v-for="preset in filteredListPresets"
                  :key="preset.type"
                  class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors"
                  @click="handleListPresetSelect(preset.type)"
                >
                  <Icon :name="preset.icon" :size="18" class="text-muted-foreground" />
                  <span class="text-[10px] text-center leading-tight">{{ preset.name }}</span>
                </button>
              </div>
            </div>

          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
