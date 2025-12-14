import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const BASE_FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'system-ui', label: 'System' },
]

export function useFontOptions(options?: { includeInherit?: boolean }) {
  const editorStore = useEditorStore()

  const fontFamilyOptions = computed(() => {
    const pageSettings = editorStore.pageSettings
    const customFonts = pageSettings.customFonts || []
    const googleFonts = pageSettings.googleFonts || []

    const baseOptions = options?.includeInherit
      ? [{ value: '', label: 'Inherit' }, ...BASE_FONT_OPTIONS]
      : BASE_FONT_OPTIONS

    const googleOptions = googleFonts.map(font => ({
      value: font.family,
      label: font.family
    }))

    const customOptions = customFonts.map(font => ({
      value: font.name,
      label: `${font.name} (Custom)`
    }))

    return [...baseOptions, ...googleOptions, ...customOptions]
  })

  const defaultFontFamily = computed(() => {
    return editorStore.pageSettings.fontFamily || 'Inter'
  })

  return {
    fontFamilyOptions,
    defaultFontFamily,
  }
}
