/**
 * SVG data URI for a placeholder when an image fails to load.
 */
export const IMAGE_FALLBACK =
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='none'%3E%3Crect width='400' height='300' fill='%23F4F4F5'/%3E%3Cpath d='M188 138h24v24h-24z' fill='%23D4D4D8'/%3E%3C/svg%3E`

/**
 * Attach to `@error` on any `<img>` to swap in the fallback when the URL fails.
 */
export function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== IMAGE_FALLBACK) {
    img.src = IMAGE_FALLBACK
  }
}
