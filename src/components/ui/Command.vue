<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Input from './Input.vue'
import Icon from './Icon.vue'

interface CommandItem {
  id: string
  label: string
  icon?: string
  shortcut?: string[]
  group?: string
  action?: () => void
}

interface Props {
  open: boolean
  items?: CommandItem[]
  placeholder?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  placeholder: 'Type a command or search...',
  emptyText: 'No results found.',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [item: CommandItem]
}>()

const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

// Filter items based on search query
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.group?.toLowerCase().includes(query)
  )
})

// Group items by their group property
const groupedItems = computed(() => {
  const groups: Record<string, CommandItem[]> = {}
  for (const item of filteredItems.value) {
    const groupName = item.group || 'Actions'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(item)
  }
  return groups
})

// Flat list for keyboard navigation
const flatItems = computed(() => filteredItems.value)

function close() {
  emit('update:open', false)
  searchQuery.value = ''
  selectedIndex.value = 0
}

function handleBackdropClick() {
  close()
}

function handleSelect(item: CommandItem) {
  emit('select', item)
  if (item.action) {
    item.action()
  }
  close()
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, flatItems.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      const selectedItem = flatItems.value[selectedIndex.value]
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

// Reset selection when search changes
watch(searchQuery, () => {
  selectedIndex.value = 0
})

// Focus input when opened
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    inputRef.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
})

// Global keyboard shortcut to open (Cmd+K / Ctrl+K)
function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    emit('update:open', !props.open)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<script lang="ts">
import CommandItem from './CommandItem.vue'
import CommandGroup from './CommandGroup.vue'
import CommandEmpty from './CommandEmpty.vue'
import CommandShortcut from './CommandShortcut.vue'

export default {
  Item: CommandItem,
  Group: CommandGroup,
  Empty: CommandEmpty,
  Shortcut: CommandShortcut,
}
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
        class="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="handleBackdropClick"
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
            class="relative bg-popover backdrop-blur-sm border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <!-- Search Input -->
            <div class="flex items-center gap-3 px-4 border-b border-border">
              <Icon name="search-1" class="text-muted-foreground" />
              <input
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                :placeholder="placeholder"
                class="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
                ESC
              </kbd>
            </div>

            <!-- Results -->
            <div class="max-h-80 overflow-y-auto p-2">
              <!-- Default slot for custom content -->
              <slot
                :search-query="searchQuery"
                :selected-index="selectedIndex"
                :handle-select="handleSelect"
              >
                <!-- Auto-generated groups if items prop is used -->
                <template v-if="items.length > 0">
                  <div v-if="filteredItems.length === 0" class="py-6 text-center">
                    <p class="text-sm text-muted-foreground">{{ emptyText }}</p>
                  </div>

                  <template v-else>
                    <div
                      v-for="(groupItems, groupName) in groupedItems"
                      :key="groupName"
                      class="mb-2 last:mb-0"
                    >
                      <p class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {{ groupName }}
                      </p>
                      <div class="space-y-0.5">
                        <button
                          v-for="(item, index) in groupItems"
                          :key="item.id"
                          class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors"
                          :class="flatItems.indexOf(item) === selectedIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50'"
                          @click="handleSelect(item)"
                          @mouseenter="selectedIndex = flatItems.indexOf(item)"
                        >
                          <Icon v-if="item.icon" :name="item.icon" :size="16" class="text-muted-foreground" />
                          <span class="flex-1">{{ item.label }}</span>
                          <span v-if="item.shortcut" class="flex items-center gap-0.5">
                            <kbd
                              v-for="key in item.shortcut"
                              :key="key"
                              class="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border"
                            >
                              {{ key }}
                            </kbd>
                          </span>
                        </button>
                      </div>
                    </div>
                  </template>
                </template>
              </slot>
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
