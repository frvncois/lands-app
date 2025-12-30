import type { Theme } from '@/types/sections'

export const softTheme: Theme = {
  id: 'soft',
  name: 'Soft',
  description: 'Warm and approachable with rounded elements',
  isDark: false,

  tokens: {
    colors: {
      background: '#faf8f5',
      foreground: '#3d3d3d',
      primary: '#3d3d3d',
      primaryForeground: '#ffffff',
      secondary: '#f3efe9',
      secondaryForeground: '#3d3d3d',
      muted: '#9c9c9c',
      mutedForeground: '#7a7a7a',
      accent: '#e07a5f',
      accentForeground: '#ffffff',
      border: '#e8e4de',
    },
    fonts: {
      heading: 'Telma, sans-serif',
      body: 'Familjen Grotesk, sans-serif',
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
      section: '6rem',
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
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    button: {
      borderRadius: '9999px',
      paddingX: '1.75rem',
      paddingY: '0.75rem',
      fontWeight: '500',
    },
  },

  sectionPresets: {
    hero: {
      defaultVariant: 'stacked',
    },
  },
}
