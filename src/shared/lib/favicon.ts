/**
 * Generate a favicon URL from a given page URL.
 * Uses Google's favicon service as a reliable proxy.
 */
export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}
