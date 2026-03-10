import { supabase } from '@/lib/supabase'
import type { Section } from '@/types/section'

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

export const storageService = {
  async upload(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
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
