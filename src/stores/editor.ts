import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Section } from '@/types/section'
import type { Land } from '@/types/land'
import type { LandTheme } from '@/types/theme'

export const useEditorStore = defineStore('editor', () => {
  const isEditMode = ref(false)
  const activeSection = ref<Section | null>(null)
  const showSectionSettings = ref(false)
  const isDirty = ref(false)
  const hasUnpublishedChanges = ref(false)
  const landSnapshot = ref<Land | null>(null)
  const themeSnapshot = ref<LandTheme | null>(null)
  const panelPos = ref({ x: (typeof window !== 'undefined' ? window.innerWidth : 1280) - 336, y: 80 })

  function enterEditMode() {
    isEditMode.value = true
  }

  function exitEditMode() {
    isEditMode.value = false
    activeSection.value = null
    showSectionSettings.value = false
    isDirty.value = false
    landSnapshot.value = null
    themeSnapshot.value = null
  }

  function takeSnapshot(land: Land, theme: LandTheme | null) {
    landSnapshot.value = JSON.parse(JSON.stringify(land))
    themeSnapshot.value = theme ? JSON.parse(JSON.stringify(theme)) : null
  }

  function setActiveSection(section: Section | null, openSettings = false) {
    activeSection.value = section
    if (openSettings) showSectionSettings.value = true
  }

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
    hasUnpublishedChanges.value = true
  }

  function markPublished() {
    hasUnpublishedChanges.value = false
  }

  function setPanelPos(pos: { x: number; y: number }) {
    panelPos.value = pos
  }

  return {
    isEditMode,
    activeSection,
    showSectionSettings,
    isDirty,
    hasUnpublishedChanges,
    landSnapshot,
    themeSnapshot,
    enterEditMode,
    exitEditMode,
    takeSnapshot,
    setActiveSection,
    markDirty,
    markClean,
    markPublished,
    panelPos,
    setPanelPos,
  }
})
