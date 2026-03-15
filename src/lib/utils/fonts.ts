const loaded = new Set<string>()

/**
 * Dynamically injects a Google Fonts stylesheet for the given family name.
 * Safe to call multiple times — deduplicates by family name.
 */
export function loadGoogleFont(family: string) {
  if (loaded.has(family)) return
  loaded.add(family)
  const encoded = family.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700;800&display=swap`
  document.head.appendChild(link)
}
