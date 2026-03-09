import { apiRequest } from './api'
import type { Land } from '@/types/land'

export const landService = {
  async getMyLands(): Promise<Land[]> {
    return apiRequest<Land[]>('/lands')
  },

  async getLandByHandle(handle: string): Promise<Land> {
    return apiRequest<Land>(`/lands/${handle}`)
  },

  async createLand(data: { handle: string; title: string }): Promise<Land> {
    return apiRequest<Land>('/lands', { method: 'POST', body: data })
  },

  async updateLand(id: string, data: Partial<Land>): Promise<Land> {
    return apiRequest<Land>(`/lands/${id}`, { method: 'PATCH', body: data })
  },

  async deleteLand(id: string): Promise<void> {
    return apiRequest<void>(`/lands/${id}`, { method: 'DELETE' })
  },
}
