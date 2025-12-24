import type { Theme } from '@/types/sections'

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Sleek dark mode with vibrant accents',
  isDark: true,

  tokens: {
    colors: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      primary: '#fafafa',
      primaryForeground: '#0a0a0a',
      secondary: '#1a1a1a',
      secondaryForeground: '#fafafa',
      muted: '#a3a3a3',
      mutedForeground: '#737373',
      accent: '#8b5cf6',
      accentForeground: '#ffffff',
      border: '#262626',
    },
    fonts: {
      heading: 'Switzer, sans-serif',
      body: 'Switzer, sans-serif',
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
      defaultVariant: 'overlay',
    },
  },
}
