/**
 * Thumbnail Generation Utility
 *
 * Generates 500x500 webp thumbnails from the editor preview
 * and uploads them to Supabase storage
 */

import { domToCanvas } from 'modern-screenshot'
import { supabase } from '@/lib/supabase'

const THUMBNAIL_SIZE = 500
const THUMBNAIL_QUALITY = 0.8

/**
 * Capture the editor preview element and generate a 500x500 webp thumbnail
 */
export async function generateThumbnail(element: HTMLElement): Promise<Blob | null> {
  try {
    // Capture element to canvas
    // Note: Custom fonts using blob URLs will show security errors in console
    // but the thumbnail still generates - these are non-fatal warnings
    const canvas = await domToCanvas(element, {
      scale: 1,
      backgroundColor: '#ffffff',
      // Use system fonts as fallback when custom fonts fail
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      // Filter function to handle problematic nodes
      filter: (node: Node) => {
        // Skip style elements that might contain blob URL font references
        if (node instanceof HTMLStyleElement) {
          const text = node.textContent || ''
          if (text.includes('blob:')) {
            return false
          }
        }
        return true
      },
    })

    // Create thumbnail canvas
    const thumbnailCanvas = document.createElement('canvas')
    thumbnailCanvas.width = THUMBNAIL_SIZE
    thumbnailCanvas.height = THUMBNAIL_SIZE
    const ctx = thumbnailCanvas.getContext('2d')

    if (!ctx) {
      console.error('[Thumbnail] Failed to get canvas context')
      return null
    }

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE)

    // Calculate dimensions to crop to square from top
    const sourceWidth = canvas.width
    const sourceHeight = canvas.height
    const cropSize = Math.min(sourceWidth, sourceHeight)

    // Draw scaled and cropped image
    ctx.drawImage(
      canvas,
      0, 0, cropSize, cropSize, // Source: crop to square from top-left
      0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE // Destination: fill thumbnail
    )

    // Convert to webp blob
    return new Promise<Blob | null>((resolve) => {
      thumbnailCanvas.toBlob(
        (blob) => resolve(blob),
        'image/webp',
        THUMBNAIL_QUALITY
      )
    })
  } catch (error) {
    console.error('[Thumbnail] Failed to generate thumbnail:', error)
    return null
  }
}

/**
 * Upload a thumbnail blob to Supabase storage
 */
export async function uploadThumbnail(
  projectId: string,
  _userId: string,
  blob: Blob
): Promise<string | null> {
  try {
    // Use projectId-based path to match existing RLS policies
    const filePath = `${projectId}/thumbnail.webp`

    // Upload to storage (upsert to replace existing)
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('[Thumbnail] Upload failed:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('[Thumbnail] Upload error:', error)
    return null
  }
}

/**
 * Update project with thumbnail URL
 */
export async function updateProjectThumbnail(
  projectId: string,
  thumbnailUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', projectId)

    if (error) {
      console.error('[Thumbnail] Failed to update project:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Thumbnail] Update error:', error)
    return false
  }
}

/**
 * Generate and upload thumbnail for a project
 * Returns the thumbnail URL on success, null on failure
 */
export async function generateAndUploadThumbnail(
  element: HTMLElement,
  projectId: string,
  userId: string
): Promise<string | null> {
  // Generate thumbnail
  const blob = await generateThumbnail(element)
  if (!blob) {
    return null
  }

  // Upload to storage
  const url = await uploadThumbnail(projectId, userId, blob)
  if (!url) {
    return null
  }

  // Update project record
  const success = await updateProjectThumbnail(projectId, url)
  if (!success) {
    return null
  }

  return url
}
