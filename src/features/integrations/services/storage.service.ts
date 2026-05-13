import { supabase } from '@/shared/lib/supabase'
import type { Section } from '@/features/sections/types'

const BUCKET = 'projects'

/** Collect every Supabase storage URL embedded in a section's content/settings. */
export function extractSectionUrls(section: Section): string[] {
  const marker = `/object/public/${BUCKET}/`
  const urls: string[] = []

  function scan(value: unknown) {
    if (!value) return
    if (typeof value === 'string') {
      if (value.includes(marker)) urls.push(value)
    } else if (Array.isArray(value)) {
      value.forEach(scan)
    } else if (typeof value === 'object') {
      Object.values(value).forEach(scan)
    }
  }

  scan(section.content)
  scan(section.settings_json)
  return urls
}

async function optimizeImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Image conversion failed')),
        'image/webp',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

export const storageService = {
  async upload(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isImage = file.type.startsWith('image/')
    const uploadFile = isImage ? await optimizeImage(file) : file
    const ext = isImage ? 'webp' : (file.name.split('.').pop() ?? 'bin')
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
      cacheControl: '31536000', // 1 year
      upsert: false,
    })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async remove(url: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Extract path from public URL
    const marker = `/object/public/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return
    const path = url.slice(idx + marker.length)

    await supabase.storage.from(BUCKET).remove([path])
  },
}
