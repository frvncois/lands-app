import type { Theme } from '@/types/sections'

export const modernTheme: Theme = {
  id: 'modern',
  name: 'Modern',
  description: 'Clean and modern with generous whitespace',
  isDark: false,

  tokens: {
    colors: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      primary: '#0a0a0a',
      primaryForeground: '#ffffff',
      secondary: '#f5f5f5',
      secondaryForeground: '#0a0a0a',
      muted: '#737373',
      mutedForeground: '#525252',
      accent: '#3b82f6',
      accentForeground: '#ffffff',
      border: '#e5e5e5',
    },
    fonts: {
      heading: 'Satoshi, sans-serif',
      body: 'Satoshi, sans-serif',
      mono: 'Geist Mono, monospace',
    },
    fontScale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    spacing: {
      section: '5rem',
      container: '1.5rem',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    radius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    button: {
      borderRadius: '0.5rem',
      paddingX: '1.5rem',
      paddingY: '0.75rem',
      fontWeight: '500',
    },
  },

  sectionPresets: {
    hero: {
      defaultVariant: 'stacked',
    },
    links: {
      defaultVariant: 'stacked',
    },
  },
}
