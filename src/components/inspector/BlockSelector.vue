<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'
import { sectionBlockLabels, sectionBlockIcons } from '@/lib/editor-utils'
import type { SectionBlock } from '@/types/editor'

const props = defineProps<{
  modelValue: string
  currentBlockId: string  // The trigger block (to show "Current block" option)
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorStore = useEditorStore()

// Dropdown state
const isOpen = ref(false)

// Get the selected block
const selectedBlock = computed(() => {
  if (!props.modelValue) return null
  return editorStore.findBlockById(props.modelValue)
})

// Get display label for selected block
const selectedLabel = computed(() => {
  if (!props.modelValue) return 'Select block...'
  if (props.modelValue === props.currentBlockId) return 'Current block (self)'
  const block = selectedBlock.value
  if (!block) return 'Unknown block'
  return block.name || sectionBlockLabels[block.type]
})

// Build flat list of all blocks with indentation info
interface BlockItem {
  block: SectionBlock
  depth: number
  isCurrentBlock: boolean
}

const allBlocks = computed(() => {
  const items: BlockItem[] = []

  function traverse(blocks: SectionBlock[], depth: number) {
    for (const block of blocks) {
      items.push({
        block,
        depth,
        isCurrentBlock: block.id === props.currentBlockId,
      })
      if (block.children && block.children.length > 0) {
        traverse(block.children, depth + 1)
      }
    }
  }

  traverse(editorStore.blocks, 0)
  return items
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleSelect(blockId: string) {
  emit('update:modelValue', blockId)
  closeDropdown()
}
</script>

<template>
  <div class="relative">
    <!-- Dropdown trigger -->
    <button
      type="button"
      class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors text-left"
      @click="toggleDropdown"
    >
      <!-- Icon -->
      <Icon
        v-if="selectedBlock"
        :name="sectionBlockIcons[selectedBlock.type]"
        :size="12"
        class="text-muted-foreground shrink-0"
      />
      <span
        v-else
        class="w-3 h-3 rounded bg-muted-foreground/30 shrink-0"
      />

      <!-- Label -->
      <span class="flex-1 truncate" :class="selectedBlock ? 'text-foreground' : 'text-muted-foreground'">
        {{ selectedLabel }}
      </span>

      <Icon name="chevron-down" :size="10" class="text-muted-foreground shrink-0" />
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      >
        <div class="max-h-64 overflow-y-auto">
          <!-- Current block option (always first) -->
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-violet-500/10 transition-colors text-left"
            :class="modelValue === currentBlockId ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : ''"
            @click="handleSelect(currentBlockId)"
          >
            <Icon name="target" :size="12" class="text-violet-500 shrink-0" />
            <span class="flex-1">Current block (self)</span>
            <Icon v-if="modelValue === currentBlockId" name="check" :size="12" class="text-violet-500" />
          </button>

          <!-- Divider -->
          <div class="border-t border-border my-1" />

          <!-- Other blocks -->
          <button
            v-for="item in allBlocks"
            :key="item.block.id"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
            :class="[
              modelValue === item.block.id && item.block.id !== currentBlockId ? 'bg-muted/30' : '',
              item.isCurrentBlock ? 'opacity-50' : ''
            ]"
            :style="{ paddingLeft: `${12 + item.depth * 12}px` }"
            :disabled="item.isCurrentBlock"
            @click="handleSelect(item.block.id)"
          >
            <Icon
              :name="sectionBlockIcons[item.block.type]"
              :size="12"
              class="shrink-0"
              :class="item.isCurrentBlock ? 'text-muted-foreground' : 'text-muted-foreground'"
            />
            <span class="flex-1 truncate">
              {{ item.block.name || sectionBlockLabels[item.block.type] }}
              <span v-if="item.isCurrentBlock" class="text-muted-foreground"> (trigger)</span>
            </span>
            <Icon
              v-if="modelValue === item.block.id && item.block.id !== currentBlockId"
              name="check"
              :size="12"
              class="text-foreground"
            />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    />
  </div>
</template>
