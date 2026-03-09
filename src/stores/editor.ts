import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Section } from '@/types/section'

export const useEditorStore = defineStore('editor', () => {
  const isEditMode = ref(false)
  const activeSection = ref<Section | null>(null)
  const showSectionSettings = ref(false)
  const isDirty = ref(false)
  const isDragging = ref(false)
  const leftPanelTab = ref<'sections' | 'theme' | 'settings'>('sections')
  const panelPos = ref({ x: window.innerWidth - 336, y: 80 })

  function enterEditMode() {
    isEditMode.value = true
  }

  function exitEditMode() {
    isEditMode.value = false
    activeSection.value = null
    showSectionSettings.value = false
    leftPanelTab.value = 'sections'
    isDirty.value = false
  }

  function setActiveSection(section: Section | null, openSettings = false) {
    activeSection.value = section
    if (openSettings) showSectionSettings.value = true
  }

  function setLeftPanelTab(tab: 'sections' | 'theme' | 'settings') {
    leftPanelTab.value = tab
  }

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  function setDragging(dragging: boolean) {
    isDragging.value = dragging
  }

  function setPanelPos(pos: { x: number; y: number }) {
    panelPos.value = pos
  }

  return {
    isEditMode,
    activeSection,
    showSectionSettings,
    isDirty,
    isDragging,
    leftPanelTab,
    enterEditMode,
    exitEditMode,
    setActiveSection,
    setLeftPanelTab,
    markDirty,
    markClean,
    setDragging,
    panelPos,
    setPanelPos,
  }
})
