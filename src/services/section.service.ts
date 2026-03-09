import { apiRequest } from './api'
import type { Section, SectionType } from '@/types/section'

export const sectionService = {
  async create(data: {
    type: SectionType
    position: string
    style_variant: string
    settings_json: Record<string, unknown>
  }): Promise<Section> {
    return apiRequest<Section>('/sections', { method: 'POST', body: data })
  },

  async update(id: string, data: Partial<Section>): Promise<Section> {
    return apiRequest<Section>(`/sections/${id}`, { method: 'PATCH', body: data })
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/sections/${id}`, { method: 'DELETE' })
  },

  async reorder(id: string, newPosition: string): Promise<Section> {
    return apiRequest<Section>(`/sections/${id}/reorder`, {
      method: 'PATCH',
      body: { position: newPosition },
    })
  },
}
