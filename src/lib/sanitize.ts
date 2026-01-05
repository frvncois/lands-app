/**
 * SANITIZATION UTILITIES
 *
 * Input sanitization and validation helpers.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content (for rich text fields)
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

/**
 * Sanitize plain text (remove HTML)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize URL (ensure it's safe)
 */
export function sanitizeUrl(url: string): string {
  // Allow only http, https, mailto, tel protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']

  try {
    const parsed = new URL(url)
    if (!allowedProtocols.includes(parsed.protocol)) {
      return ''
    }
    return url
  } catch {
    // If not a valid URL, check if it's a relative path
    if (url.startsWith('/') || url.startsWith('#')) {
      return url
    }
    return ''
  }
}

/**
 * Escape HTML entities (for display in text context)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char] || char)
}
