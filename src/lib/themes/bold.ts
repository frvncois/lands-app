import type { Theme } from '@/types/sections'

export const boldTheme: Theme = {
  id: 'bold',
  name: 'Bold',
  description: 'Strong contrasts and dramatic typography',
  isDark: false,

  tokens: {
    colors: {
      background: '#fffbeb',
      foreground: '#1c1917',
      primary: '#dc2626',
      primaryForeground: '#ffffff',
      secondary: '#fef3c7',
      secondaryForeground: '#1c1917',
      muted: '#78716c',
      mutedForeground: '#57534e',
      accent: '#ea580c',
      accentForeground: '#ffffff',
      border: '#e7e5e4',
    },
    fonts: {
      heading: 'Clash Grotesk, sans-serif',
      body: 'Cabinet Grotesk, sans-serif',
      mono: 'Geist Mono, monospace',
    },
    fontScale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1.0625rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '1.875rem',
      '3xl': '2.25rem',
      '4xl': '3rem',
      '5xl': '4rem',
    },
    spacing: {
      section: '6rem',
      container: '2rem',
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
      paddingX: '2rem',
      paddingY: '1rem',
      fontWeight: '700',
    },
  },

  sectionPresets: {
    hero: {
      defaultVariant: 'split',
    },
  },
}
