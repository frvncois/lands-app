<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Icon from './Icon.vue'

export interface ComboboxItem {
  value: string
  label: string
  icon?: string
  group?: string
}

interface Props {
  items: ComboboxItem[]
  searchPlaceholder?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  emptyText: 'No results found',
})

const emit = defineEmits<{
  select: [value: string]
}>()

const search = ref('')
const searchInputRef = ref<HTMLInputElement>()
const highlightedIndex = ref(0)

// Group items by their group property
const groupedItems = computed(() => {
  const filtered = props.items.filter(item =>
    item.label.toLowerCase().includes(search.value.toLowerCase())
  )

  const groups: Record<string, ComboboxItem[]> = {}
  const ungrouped: ComboboxItem[] = []

  for (const item of filtered) {
    if (item.group) {
      const group = item.group
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group]!.push(item)
    } else {
      ungrouped.push(item)
    }
  }

  return { groups, ungrouped }
})

// Flat list of filtered items for keyboard navigation
const flatFilteredItems = computed(() => {
  const result: ComboboxItem[] = []

  for (const items of Object.values(groupedItems.value.groups)) {
    result.push(...items)
  }
  result.push(...groupedItems.value.ungrouped)

  return result
})

const hasResults = computed(() => flatFilteredItems.value.length > 0)

function selectItem(item: ComboboxItem) {
  emit('select', item.value)
  search.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        flatFilteredItems.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter': {
      event.preventDefault()
      const selectedItem = flatFilteredItems.value[highlightedIndex.value]
      if (selectedItem) {
        selectItem(selectedItem)
      }
      break
    }
  }
}

// Reset highlighted index when search changes
watch(search, () => {
  highlightedIndex.value = 0
})

// Focus search input when mounted
function focusSearch() {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

defineExpose({ focusSearch })
</script>

<template>
  <div
    class="w-full min-w-56 overflow-hidden"
    @click.stop
    @keydown="handleKeydown"
  >
    <!-- Search Input -->
    <div class="p-2 border-b border-border">
      <div class="relative">
        <Icon
          name="search-1"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"
        />
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full h-8 pl-8 pr-3 text-xs bg-input border rounded-lg shadow-xs text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring/25 focus:bg-background"
        />
      </div>
    </div>

    <!-- Items List -->
    <div class="max-h-64 overflow-y-auto p-1">
      <!-- Empty State -->
      <div
        v-if="!hasResults"
        class="px-3 py-6 text-center"
      >
        <p class="text-xs text-muted-foreground">
          {{ emptyText }}
        </p>
      </div>

      <!-- Grouped Items -->
      <template v-else>
        <div
          v-for="(groupItems, groupName) in groupedItems.groups"
          :key="groupName"
          class="mb-1 last:mb-0"
        >
          <div class="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {{ groupName }}
          </div>
          <button
            v-for="item in groupItems"
            :key="item.value"
            class="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md transition-colors"
            :class="[
              flatFilteredItems.indexOf(item) === highlightedIndex
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/50'
            ]"
            @click.stop="selectItem(item)"
            @mouseenter="highlightedIndex = flatFilteredItems.indexOf(item)"
          >
            <div
              v-if="item.icon"
              class="w-4 h-4 flex items-center justify-center shrink-0"
            >
              <Icon
                :name="item.icon"
                class="text-muted-foreground"
              />
            </div>
            <span class="flex-1 text-left truncate">{{ item.label }}</span>
          </button>
        </div>

        <!-- Ungrouped Items -->
        <div v-if="groupedItems.ungrouped.length > 0">
          <button
            v-for="item in groupedItems.ungrouped"
            :key="item.value"
            class="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md transition-colors"
            :class="[
              flatFilteredItems.indexOf(item) === highlightedIndex
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/50'
            ]"
            @click.stop="selectItem(item)"
            @mouseenter="highlightedIndex = flatFilteredItems.indexOf(item)"
          >
            <div
              v-if="item.icon"
              class="w-4 h-4 flex items-center justify-center shrink-0"
            >
              <Icon
                :name="item.icon"
                class="text-muted-foreground"
              />
            </div>
            <span class="flex-1 text-left truncate">{{ item.label }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
