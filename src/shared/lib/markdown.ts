import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure marked for basic formatting only
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function renderMarkdown(input: string): string {
  if (!input) return ''
  const raw = marked.parse(input, { async: false }) as string
  return DOMPurify.sanitize(raw)
}
