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
      {
        id: 'instrument-inter',
        label: 'Serif',
        titleFont:       '"Instrument Serif", ui-serif, Georgia, serif',
        bodyFont:        '"Inter", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Instrument Serif',
        bodyGoogleFont:  'Inter',
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

  [THEME_PRESETS.baseline]: {
    label: 'Baseline',
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
      {
        id: 'instrument-inter',
        label: 'Serif',
        titleFont:       '"Instrument Serif", ui-serif, Georgia, serif',
        bodyFont:        '"Inter", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Instrument Serif',
        bodyGoogleFont:  'Inter',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.baseline,
      color_main:    '#18181B',
      color_accent:  '#6366F1',
      color_surface: '#F4F4F5',
      font_title: '"Inter", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Inter", ui-sans-serif, system-ui, sans-serif',
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

  [THEME_PRESETS.feed]: {
    label: 'Feed',
    description: 'App-style layout. Hero + tabs for each content type.',
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
        id: 'grotesk-worksans',
        label: 'Grotesk',
        titleFont:       '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
        bodyFont:        '"Work Sans", ui-sans-serif, system-ui, sans-serif',
        titleGoogleFont: 'Space Grotesk',
        bodyGoogleFont:  'Work Sans',
      },
    ],
    defaults: {
      theme_preset: THEME_PRESETS.feed,
      color_main:    '#18181B',
      color_accent:  '#6366F1',
      color_surface: '#F4F4F5',
      font_title: '"Inter", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
  },
}
