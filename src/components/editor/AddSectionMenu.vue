<script setup lang="ts">
/**
 * ADD SECTION MENU
 *
 * Generated from section registry.
 * NO hardcoded section types.
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getAllSectionDefinitions } from '@/lib/section-registry'
import type { SectionDefinition } from '@/types/sections'
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
const hoveredSection = ref<SectionDefinition | null>(null)
const hoveredSectionElement = ref<HTMLElement | null>(null)
const popoverPosition = ref({ top: 0, left: 0 })
const popoverRef = ref<HTMLElement | null>(null)
const hidePopoverTimeout = ref<number | null>(null)

const showPopover = computed(() => hoveredSection.value !== null)

function addSection(type: string) {
  editor.addSection(type)
  // Close both menu and popover
  hoveredSection.value = null
  hoveredSectionElement.value = null
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
  // Clear any pending timeout
  if (hidePopoverTimeout.value) {
    clearTimeout(hidePopoverTimeout.value)
    hidePopoverTimeout.value = null
  }
  // Force close the section details popover
  hoveredSection.value = null
  hoveredSectionElement.value = null
}

function handleClickOutside(e: MouseEvent) {
  if (!isOpen.value) return

  const target = e.target as Node

  // Don't close if clicking the button
  if (buttonRef.value?.contains(target)) return

  // Don't close if clicking inside the menu
  const menu = document.getElementById('add-section-menu')
  if (menu?.contains(target)) return

  // Don't close if clicking inside the popover
  if (popoverRef.value?.contains(target)) return

  // Close if clicking anywhere else (including canvas)
  close()
}

function handleSectionHover(section: SectionDefinition, event: MouseEvent) {
  // Clear any pending hide timeout
  if (hidePopoverTimeout.value) {
    clearTimeout(hidePopoverTimeout.value)
    hidePopoverTimeout.value = null
  }

  hoveredSection.value = section
  hoveredSectionElement.value = event.currentTarget as HTMLElement
  updatePopoverPosition()
}

function handleSectionLeave() {
  // Delay hiding to allow moving mouse to the popover
  hidePopoverTimeout.value = window.setTimeout(() => {
    hoveredSection.value = null
    hoveredSectionElement.value = null
  }, 150)
}

function handlePopoverEnter() {
  // Cancel hiding when mouse enters the popover
  if (hidePopoverTimeout.value) {
    clearTimeout(hidePopoverTimeout.value)
    hidePopoverTimeout.value = null
  }
}

function handlePopoverLeave() {
  // Hide immediately when leaving the popover
  hoveredSection.value = null
  hoveredSectionElement.value = null
}

function updatePopoverPosition() {
  if (!hoveredSectionElement.value) return

  const rect = hoveredSectionElement.value.getBoundingClientRect()
  const menuEl = document.getElementById('add-section-menu')
  if (!menuEl) return

  const menuRect = menuEl.getBoundingClientRect()

  // Position popover to the right of the menu
  popoverPosition.value = {
    top: Math.max(16, Math.min(rect.top, window.innerHeight - 300)),
    left: menuRect.right + 8,
  }
}

// Watch for menu close and force close the popover
watch(isOpen, (newValue) => {
  if (!newValue) {
    hoveredSection.value = null
    hoveredSectionElement.value = null
  }
})

onMounted(() => {
  // Use capture phase to ensure we catch clicks even if something stops propagation
  document.addEventListener('mousedown', handleClickOutside, true)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside, true)
  document.removeEventListener('click', handleClickOutside)
  // Clear any pending timeout
  if (hidePopoverTimeout.value) {
    clearTimeout(hidePopoverTimeout.value)
  }
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
              @mouseenter="handleSectionHover(section, $event)"
              @mouseleave="handleSectionLeave"
            >
              <Icon :name="section.icon" :size="20" class="text-muted-foreground group-hover:text-primary transition-colors" />
              <span class="text-xs font-medium text-foreground">{{ section.displayName }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Section Details Popover -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div
          v-if="showPopover && hoveredSection"
          ref="popoverRef"
          class="fixed w-64 bg-popover border border-border rounded-xl shadow-xl z-[101] p-4"
          :style="{ top: popoverPosition.top + 'px', left: popoverPosition.left + 'px' }"
          @mouseenter="handlePopoverEnter"
          @mouseleave="handlePopoverLeave"
        >
          <div class="space-y-3">
            <div>
              <h3 class="font-semibold text-sm text-foreground mb-1">{{ hoveredSection.displayName }}</h3>
              <p v-if="hoveredSection.description" class="text-xs text-muted-foreground">
                {{ hoveredSection.description }}
              </p>
            </div>

            <div v-if="hoveredSection.variants && hoveredSection.variants.length > 0">
              <div class="text-xs font-medium text-foreground mb-1">Variants</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="variant in hoveredSection.variants"
                  :key="variant.id"
                  class="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
                >
                  {{ variant.label }}
                </span>
              </div>
            </div>

            <div v-if="hoveredSection.useCase" class="text-xs text-muted-foreground border-t border-border pt-2">
              <span class="font-medium text-foreground">Use case:</span> {{ hoveredSection.useCase }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
