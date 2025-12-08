<script lang="ts">
// Track all open context menus globally to close others when opening a new one
// This is outside setup so it's shared across all instances
const activeContextMenus = new Set<() => void>()

import ContextMenuItem from './ContextMenuItem.vue'
import ContextMenuDivider from './ContextMenuDivider.vue'

export default {
  Item: ContextMenuItem,
  Divider: ContextMenuDivider,
}
</script>

<script setup lang="ts">
import { ref, onUnmounted, nextTick, watch } from 'vue'

const isOpen = ref(false)
const position = ref({ x: 0, y: 0 })
const menuRef = ref<HTMLElement | null>(null)

function open(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  // Close all other open context menus first
  activeContextMenus.forEach(closeFunc => closeFunc())
  activeContextMenus.clear()

  // Register this menu's close function
  activeContextMenus.add(close)

  // Set initial position
  position.value = { x: event.clientX, y: event.clientY }
  isOpen.value = true

  // Adjust position if menu would go off-screen
  nextTick(() => {
    if (menuRef.value) {
      const rect = menuRef.value.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (position.value.x + rect.width > viewportWidth) {
        position.value.x = viewportWidth - rect.width - 8
      }
      if (position.value.y + rect.height > viewportHeight) {
        position.value.y = viewportHeight - rect.height - 8
      }
    }
  })
}

function close() {
  isOpen.value = false
  activeContextMenus.delete(close)
}

function handleGlobalClick(event: MouseEvent) {
  // Close if clicking outside the menu
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close()
  }
}

function handleGlobalContextMenu(event: MouseEvent) {
  // Close if right-clicking outside the menu
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

// Add/remove listeners when menu opens/closes
watch(isOpen, (open) => {
  if (open) {
    // Use setTimeout to avoid the same click that opened the menu from closing it
    setTimeout(() => {
      document.addEventListener('click', handleGlobalClick, true)
      document.addEventListener('contextmenu', handleGlobalContextMenu, true)
      document.addEventListener('keydown', handleKeydown)
    }, 0)
  } else {
    document.removeEventListener('click', handleGlobalClick, true)
    document.removeEventListener('contextmenu', handleGlobalContextMenu, true)
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true)
  document.removeEventListener('contextmenu', handleGlobalContextMenu, true)
  document.removeEventListener('keydown', handleKeydown)
  activeContextMenus.delete(close)
})

defineExpose({ open, close, isOpen })
</script>

<template>
  <Teleport to="body">
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
        ref="menuRef"
        class="fixed bg-popover backdrop-blur-sm p-1.5 border border-border rounded-xl shadow-lg z-50 min-w-[180px] origin-top-left"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
        @click="close"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
