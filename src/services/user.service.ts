import { apiRequest } from './api'
import type { User } from '@/types/user'

export const userService = {
  async getMe(): Promise<User> {
    return apiRequest<User>('/users/me')
  },

  async updateMe(data: Partial<User>): Promise<User> {
    return apiRequest<User>('/users/me', { method: 'PATCH', body: data })
  },

  async deleteAccount(): Promise<void> {
    return apiRequest<void>('/users/me', { method: 'DELETE' })
  },
}
