import { marked } from 'marked'

// Configure marked for basic formatting only
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function renderMarkdown(input: string): string {
  if (!input) return ''
  return marked.parse(input, { async: false }) as string
}
