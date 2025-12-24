<script setup lang="ts">
/**
 * ADD SECTION MENU
 *
 * Generated from section registry.
 * NO hardcoded section types.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getAllSectionDefinitions } from '@/lib/section-registry'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

const emit = defineEmits<{
  close: []
}>()

const editor = useEditorStore()
const sections = getAllSectionDefinitions()
const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

function addSection(type: string) {
  editor.addSection(type)
  isOpen.value = false
  emit('close')
}

function updatePosition() {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    menuPosition.value = {
      top: rect.bottom + 8,
      left: rect.left
    }
  }
}

function toggle() {
  updatePosition()
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (isOpen.value && buttonRef.value && !buttonRef.value.contains(e.target as Node)) {
    const menu = document.getElementById('add-section-menu')
    if (menu && !menu.contains(e.target as Node)) {
      close()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="buttonRef">
    <Button size="icon" variant="outline" @click="toggle">
      <Icon name="+" :size="14" />
    </Button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="isOpen"
          id="add-section-menu"
          class="fixed w-72 bg-card border border-border rounded-xl shadow-xl z-[100] overflow-hidden"
          :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-border">
            <span class="text-sm font-semibold text-foreground">Add Section</span>
            <Button variant="ghost" size="icon-sm" @click="close">
              <Icon name="app-remove" :size="14" />
            </Button>
          </div>

          <div class="grid grid-cols-2 gap-1 p-2">
            <button
              v-for="section in sections"
              :key="section.type"
              class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted transition-colors group"
              @click="addSection(section.type)"
            >
              <Icon :name="section.icon" :size="20" class="text-muted-foreground group-hover:text-primary transition-colors" />
              <span class="text-xs font-medium text-foreground">{{ section.displayName }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
