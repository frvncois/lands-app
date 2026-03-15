import { THEME_PRESETS, type ThemePreset, type LandTheme } from '@/types/theme'

export interface FontOption {
  id: string          // CSS font-family name (also used as Google Font family)
  label: string       // Display name
  fontFamily: string  // Full CSS font-family stack
  googleFont?: string // Google Fonts family name to load (undefined = custom/system font)
}

export interface ThemeFontOptions {
  title: FontOption[]
  body: FontOption[]
}

export interface ThemeColorSlot {
  key: 'color_main' | 'color_accent' | 'color_surface'
  label: string
}

export interface ThemePresetDefinition {
  label: string
  description: string
  colorSlots: ThemeColorSlot[]
  fonts: ThemeFontOptions
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
    fonts: {
      title: [
        { id: 'Inter',              label: 'Inter',         fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',              googleFont: 'Inter' },
        { id: 'DM Sans',            label: 'DM Sans',       fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',            googleFont: 'DM Sans' },
        { id: 'Outfit',             label: 'Outfit',        fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',             googleFont: 'Outfit' },
        { id: 'Plus Jakarta Sans',  label: 'Jakarta',       fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',  googleFont: 'Plus Jakarta Sans' },
      ],
      body: [
        { id: 'Inter',              label: 'Inter',         fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',              googleFont: 'Inter' },
        { id: 'DM Sans',            label: 'DM Sans',       fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',            googleFont: 'DM Sans' },
        { id: 'Nunito Sans',        label: 'Nunito',        fontFamily: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',        googleFont: 'Nunito Sans' },
        { id: 'Lato',               label: 'Lato',          fontFamily: '"Lato", ui-sans-serif, system-ui, sans-serif',               googleFont: 'Lato' },
      ],
    },
    defaults: {
      theme_preset: THEME_PRESETS.minimal,
      color_main: '#18181B',
      color_accent: '#6366F1',
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
    fonts: {
      title: [
        { id: 'Syne',                  label: 'Syne',        fontFamily: '"Syne", ui-sans-serif, system-ui, sans-serif',                  googleFont: 'Syne' },
        { id: 'Space Grotesk',         label: 'Grotesk',     fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',         googleFont: 'Space Grotesk' },
        { id: 'Bricolage Grotesque',   label: 'Bricolage',   fontFamily: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',   googleFont: 'Bricolage Grotesque' },
        { id: 'Bebas Neue',            label: 'Bebas',       fontFamily: '"Bebas Neue", ui-sans-serif, system-ui, sans-serif',            googleFont: 'Bebas Neue' },
      ],
      body: [
        { id: 'Manrope',               label: 'Manrope',     fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif',               googleFont: 'Manrope' },
        { id: 'Plus Jakarta Sans',     label: 'Jakarta',     fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',     googleFont: 'Plus Jakarta Sans' },
        { id: 'Work Sans',             label: 'Work Sans',   fontFamily: '"Work Sans", ui-sans-serif, system-ui, sans-serif',             googleFont: 'Work Sans' },
        { id: 'DM Sans',               label: 'DM Sans',     fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',               googleFont: 'DM Sans' },
      ],
    },
    defaults: {
      theme_preset: THEME_PRESETS.bold,
      color_main: '#2563EB',
      color_accent: '#F59E0B',
      color_surface: '#1E293B',
      font_title: '"Syne", ui-sans-serif, system-ui, sans-serif',
      font_body:  '"Manrope", ui-sans-serif, system-ui, sans-serif',
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
    fonts: {
      title: [
        { id: 'Gambarino',           label: 'Gambarino',  fontFamily: '"Gambarino-Regular", ui-serif, Georgia, serif' },
        { id: 'Playfair Display',    label: 'Playfair',   fontFamily: '"Playfair Display", ui-serif, Georgia, serif',    googleFont: 'Playfair Display' },
        { id: 'Cormorant Garamond',  label: 'Cormorant',  fontFamily: '"Cormorant Garamond", ui-serif, Georgia, serif',  googleFont: 'Cormorant Garamond' },
        { id: 'Libre Baskerville',   label: 'Baskerville',fontFamily: '"Libre Baskerville", ui-serif, Georgia, serif',   googleFont: 'Libre Baskerville' },
      ],
      body: [
        { id: 'Switzer',             label: 'Switzer',    fontFamily: '"Switzer-Regular", ui-sans-serif, system-ui, sans-serif' },
        { id: 'Lora',                label: 'Lora',       fontFamily: '"Lora", ui-serif, Georgia, serif',                       googleFont: 'Lora' },
        { id: 'Merriweather',        label: 'Merriweather',fontFamily: '"Merriweather", ui-serif, Georgia, serif',              googleFont: 'Merriweather' },
        { id: 'Source Serif 4',      label: 'Source Serif',fontFamily: '"Source Serif 4", ui-serif, Georgia, serif',            googleFont: 'Source Serif 4' },
      ],
    },
    defaults: {
      theme_preset: THEME_PRESETS.editorial,
      color_main: '#1E1E1E',
      color_accent: '#B45309',
      color_surface: '#FAF9F6',
      font_title: '"Gambarino-Regular", ui-serif, Georgia, serif',
      font_body:  '"Switzer-Regular", ui-sans-serif, system-ui, sans-serif',
    },
  },
}
