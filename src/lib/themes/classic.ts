import type { Theme } from '@/types/sections'

export const classicTheme: Theme = {
  id: 'classic',
  name: 'Classic',
  description: 'Timeless and professional with a trustworthy feel',
  isDark: false,

  tokens: {
    colors: {
      background: '#fdfcfa',
      foreground: '#1e293b',
      primary: '#1e293b',
      primaryForeground: '#ffffff',
      secondary: '#f1f0ed',
      secondaryForeground: '#1e293b',
      muted: '#64748b',
      mutedForeground: '#475569',
      accent: '#0f4c81',
      accentForeground: '#ffffff',
      border: '#e2e0db',
    },
    fonts: {
      heading: 'Quilon, serif',
      body: 'Public Sans, sans-serif',
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
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    button: {
      borderRadius: '0.375rem',
      paddingX: '1.5rem',
      paddingY: '0.75rem',
      fontWeight: '600',
    },
  },

  sectionPresets: {
    hero: {
      defaultVariant: 'split',
    },
  },
}
