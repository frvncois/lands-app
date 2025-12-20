import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'

// Base fonts with their available weights
const BASE_FONTS: Record<string, string[]> = {
  'Inter': ['100', '200', '300', 'regular', '500', '600', '700', '800', '900'],
  'Roboto': ['100', '300', 'regular', '500', '700', '900'],
  'Open Sans': ['300', 'regular', '500', '600', '700', '800'],
  'Lato': ['100', '300', 'regular', '700', '900'],
  'Poppins': ['100', '200', '300', 'regular', '500', '600', '700', '800', '900'],
  'Montserrat': ['100', '200', '300', 'regular', '500', '600', '700', '800', '900'],
  'system-ui': ['regular', '500', '600', '700'], // System fonts typically support these
}

const BASE_FONT_OPTIONS = Object.keys(BASE_FONTS).map(font => ({
  value: font,
  label: font === 'system-ui' ? 'System' : font,
}))

// Map variant strings to weight values and labels
const WEIGHT_MAP: Record<string, { value: string; label: string }> = {
  '100': { value: '100', label: 'Thin' },
  '200': { value: '200', label: 'Extra Light' },
  '300': { value: '300', label: 'Light' },
  'regular': { value: 'normal', label: 'Regular' },
  '400': { value: 'normal', label: 'Regular' },
  '500': { value: '500', label: 'Medium' },
  '600': { value: '600', label: 'Semibold' },
  '700': { value: 'bold', label: 'Bold' },
  '800': { value: '800', label: 'Extra Bold' },
  '900': { value: '900', label: 'Black' },
}

// Get weight options from variants array
function getWeightOptionsFromVariants(variants: string[]): { value: string; label: string }[] {
  const weights: { value: string; label: string }[] = []
  const seenValues = new Set<string>()

  for (const variant of variants) {
    // Skip italic variants
    if (variant.includes('italic')) continue

    const weightInfo = WEIGHT_MAP[variant]
    if (weightInfo && !seenValues.has(weightInfo.value)) {
      weights.push(weightInfo)
      seenValues.add(weightInfo.value)
    }
  }

  // Sort by weight value
  const weightOrder = ['100', '200', '300', 'normal', '500', '600', 'bold', '800', '900']
  weights.sort((a, b) => weightOrder.indexOf(a.value) - weightOrder.indexOf(b.value))

  return weights
}

export function useFontOptions(options?: { includeInherit?: boolean }) {
  const designerStore = useDesignerStore()

  const fontFamilyOptions = computed(() => {
    const pageSettings = designerStore.pageSettings
    const customFonts = pageSettings.customFonts || []
    const googleFonts = pageSettings.googleFonts || []

    const result: { value: string; label: string; separator?: boolean }[] = []

    // Add Inherit option if requested
    if (options?.includeInherit) {
      result.push({ value: '', label: 'Inherit' })
    }

    // Add custom fonts first
    for (const font of customFonts) {
      result.push({ value: font.name, label: font.name })
    }

    // Add Google fonts
    for (const font of googleFonts) {
      result.push({ value: font.family, label: font.family })
    }

    // Add separator if there are custom/google fonts
    if (customFonts.length > 0 || googleFonts.length > 0) {
      result.push({ value: '-separator-', label: '', separator: true })
    }

    // Add base fonts
    result.push(...BASE_FONT_OPTIONS)

    return result
  })

  const defaultFontFamily = computed(() => {
    return designerStore.pageSettings.fontFamily || 'Inter'
  })

  // Get weight options for a specific font
  function getFontWeightOptions(fontFamily: string | undefined): { value: string; label: string }[] {
    const font = fontFamily || defaultFontFamily.value
    const pageSettings = designerStore.pageSettings

    // Check base fonts
    const baseVariants = BASE_FONTS[font]
    if (baseVariants) {
      return getWeightOptionsFromVariants(baseVariants)
    }

    // Check Google fonts
    const googleFont = pageSettings.googleFonts?.find(f => f.family === font)
    if (googleFont?.variants) {
      return getWeightOptionsFromVariants(googleFont.variants)
    }

    // Default fallback for custom fonts or unknown fonts
    return [
      { value: 'normal', label: 'Regular' },
      { value: 'bold', label: 'Bold' },
    ]
  }

  return {
    fontFamilyOptions,
    defaultFontFamily,
    getFontWeightOptions,
  }
}
