import type { Theme } from '@/types/sections'

export const editorialTheme: Theme = {
  id: 'editorial',
  name: 'Editorial',
  description: 'Refined typography for content-focused sites',
  isDark: false,

  tokens: {
    colors: {
      background: '#ffffff',
      foreground: '#1a1a1a',
      primary: '#1a1a1a',
      primaryForeground: '#ffffff',
      secondary: '#f7f7f7',
      secondaryForeground: '#1a1a1a',
      muted: '#6b6b6b',
      mutedForeground: '#525252',
      accent: '#b45309',
      accentForeground: '#ffffff',
      border: '#e5e5e5',
    },
    fonts: {
      heading: 'Instrument Serif, serif',
      body: 'Author, serif',
      mono: 'Geist Mono, monospace',
    },
    fontScale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1.0625rem',
      lg: '1.1875rem',
      xl: '1.375rem',
      '2xl': '1.625rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
      '5xl': '3.25rem',
    },
    spacing: {
      section: '4.5rem',
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
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      full: '9999px',
    },
    button: {
      borderRadius: '0.25rem',
      paddingX: '1.5rem',
      paddingY: '0.625rem',
      fontWeight: '500',
    },
  },

  sectionPresets: {
    hero: {
      defaultVariant: 'stacked',
    },
  },
}
