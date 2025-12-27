import type { ColorTokens, FontTokens } from '@/types/sections'

// Color palette options (subset of most important colors)
export const colorOptions: { key: keyof ColorTokens; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Text' },
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
]

// Font options
export const fontOptions: { key: keyof FontTokens; label: string }[] = [
  { key: 'heading', label: 'Headings' },
  { key: 'body', label: 'Body' },
]
