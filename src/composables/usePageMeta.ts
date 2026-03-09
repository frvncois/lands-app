import { watchEffect, type Ref } from 'vue'

interface PageMeta {
  title: string
  description?: string
  image?: string
}

/**
 * Reactively set document title and meta tags.
 * Used on the public Land view for basic SEO.
 */
export function usePageMeta(meta: Ref<PageMeta | null>) {
  watchEffect(() => {
    if (!meta.value) return

    document.title = meta.value.title
      ? `${meta.value.title} — Lands`
      : 'Lands'

    let descTag = document.querySelector('meta[name="description"]')
    if (meta.value.description) {
      if (!descTag) {
        descTag = document.createElement('meta')
        descTag.setAttribute('name', 'description')
        document.head.appendChild(descTag)
      }
      descTag.setAttribute('content', meta.value.description)
    }

    setOgTag('og:title', meta.value.title)
    if (meta.value.description) {
      setOgTag('og:description', meta.value.description)
    }
    if (meta.value.image) {
      setOgTag('og:image', meta.value.image)
    }
  })
}

function setOgTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}
