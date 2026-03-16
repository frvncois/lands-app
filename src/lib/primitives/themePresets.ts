import { THEME_PRESETS, type ThemePreset, type LandTheme } from '@/types/theme'

export interface TypographyPairing {
  id: string
  label: string
  titleFont: string        // CSS font-family for title
  bodyFont: string         // CSS font-family for body
  titleGoogleFont?: string
  bodyGoogleFont?: string
}

export interface ThemeColorSlot {
  key: 'color_main' | 'color_accent' | 'color_surface'
  label: string
}

export interface ThemePresetDefinition {
  label: string
  description: string
  colorSlots: ThemeColorSlot[]
  pairings: TypographyPairing[]
  defaults: Omit<LandTheme, 'id' | 'land_id'>
}

export const THEME_PRESET_DEFINITIONS: Record<ThemePreset, ThemePresetDefinition> = {
  [THEME_PRESETS.minimal]: {
    label: 'Minimal',
    description: 'Clean and simple. Content speaks for itself.',
    colorSlots: [
      { key: 'color_main',    label: 'Main' },
      { key: 'color_accent',  label: 'Accent' },
      { key: 'color_surface', label: 'Surface' },
    ],
    pairings: [
      {
        id: 'inter-inter',
        label: 'System',
        titleFont:       '"Inter", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Inter", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Inter',
        bodyGoogleFont:  'Inter',
      },
      {
        id: 'outfit-dm',
        label: 'Geometric',
        titleFont:       '"Outfit", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Outfit',
        bodyGoogleFont:  'DM Sans',
      },
      {
        id: 'jakarta-nunito',
        label: 'Modern',
        titleFont:       '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Plus Jakarta Sans',
        bodyGoogleFont:  'Nunito Sans',
      },
      {
        id: 'dm-lato',
        label: 'Sharp',
        titleFont:       '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Lato", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'DM Sans',
        bodyGoogleFont:  'Lato',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.minimal,
      color_main:    '#18181B',
      color_accent:  '#6366F1',
      color_surface: '#F4F4F5',
      font_title: '"Inter", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
  },

  [THEME_PRESETS.bold]: {
    label: 'Bold',
    description: 'Strong presence. High contrast.',
    colorSlots: [
      { key: 'color_main',    label: 'Primary' },
      { key: 'color_accent',  label: 'Highlight' },
      { key: 'color_surface', label: 'Background' },
    ],
    pairings: [
      {
        id: 'syne-manrope',
        label: 'Impact',
        titleFont:       '"Syne", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Manrope", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Syne',
        bodyGoogleFont:  'Manrope',
      },
      {
        id: 'grotesk-worksans',
        label: 'Grotesk',
        titleFont:       '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Work Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Space Grotesk',
        bodyGoogleFont:  'Work Sans',
      },
      {
        id: 'bricolage-dm',
        label: 'Expressive',
        titleFont:       '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Bricolage Grotesque',
        bodyGoogleFont:  'DM Sans',
      },
      {
        id: 'bebas-jakarta',
        label: 'Condensed',
        titleFont:       '"Bebas Neue", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Bebas Neue',
        bodyGoogleFont:  'Plus Jakarta Sans',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.bold,
      color_main:    '#2563EB',
      color_accent:  '#F59E0B',
      color_surface: '#1E293B',
      font_title: '"Syne", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Manrope", ui-sans-serif, system-ui, sans-serif',
    },
  },

  [THEME_PRESETS.structure]: {
    label: 'Structure',
    description: 'Structured and precise. Grid-first.',
    colorSlots: [
      { key: 'color_main',    label: 'Main' },
      { key: 'color_accent',  label: 'Accent' },
      { key: 'color_surface', label: 'Surface' },
    ],
    pairings: [
      {
        id: 'inter-inter',
        label: 'System',
        titleFont:       '"Inter", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Inter", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Inter',
        bodyGoogleFont:  'Inter',
      },
      {
        id: 'outfit-dm',
        label: 'Geometric',
        titleFont:       '"Outfit", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Outfit',
        bodyGoogleFont:  'DM Sans',
      },
      {
        id: 'grotesk-worksans',
        label: 'Grotesk',
        titleFont:       '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Work Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Space Grotesk',
        bodyGoogleFont:  'Work Sans',
      },
      {
        id: 'jakarta-nunito',
        label: 'Modern',
        titleFont:       '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Plus Jakarta Sans',
        bodyGoogleFont:  'Nunito Sans',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.structure,
      color_main:    '#18181B',
      color_accent:  '#6366F1',
      color_surface: '#F4F4F5',
      font_title: '"Inter", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
  },

  [THEME_PRESETS.editorial]: {
    label: 'Editorial',
    description: 'Refined and typographic. Great for writers.',
    colorSlots: [
      { key: 'color_main',    label: 'Text' },
      { key: 'color_accent',  label: 'Ink' },
      { key: 'color_surface', label: 'Paper' },
    ],
    pairings: [
      {
        id: 'gambarino-switzer',
        label: 'Classic',
        titleFont:      '"Gambarino-Regular", ui-serif, Georgia, serif',
        bodyFont:       '"Switzer-Regular", ui-sans-serif, system-ui, sans-serif',
      },
      {
        id: 'playfair-lora',
        label: 'Literary',
        titleFont:       '"Playfair Display", ui-serif, Georgia, serif',
        bodyFont:        '"Lora", ui-serif, Georgia, serif',
        titleGoogleFont: 'Playfair Display',
        bodyGoogleFont:  'Lora',
      },
      {
        id: 'cormorant-merriweather',
        label: 'Refined',
        titleFont:       '"Cormorant Garamond", ui-serif, Georgia, serif',
        bodyFont:        '"Merriweather", ui-serif, Georgia, serif',
        titleGoogleFont: 'Cormorant Garamond',
        bodyGoogleFont:  'Merriweather',
      },
      {
        id: 'baskerville-sourceserif',
        label: 'Academic',
        titleFont:       '"Libre Baskerville", ui-serif, Georgia, serif',
        bodyFont:        '"Source Serif 4", ui-serif, Georgia, serif',
        titleGoogleFont: 'Libre Baskerville',
        bodyGoogleFont:  'Source Serif 4',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.editorial,
      color_main:    '#1E1E1E',
      color_accent:  '#B45309',
      color_surface: '#FAF9F6',
      font_title: '"Gambarino-Regular", ui-serif, Georgia, serif',
      font_body:  '"Switzer-Regular", ui-sans-serif, system-ui, sans-serif',
    },
  },
}
