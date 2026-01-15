import { apiClient } from './client'
import type { User, PaginatedResponse } from '../types/api'

export const usersApi = {
  getAll: (page?: number, limit?: number): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', String(page))
    if (limit !== undefined) params.append('limit', String(limit))
    const query = params.toString()
    return apiClient.get<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`)
  },

  getById: (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`)
  },

  create: (data: Partial<User> & { password: string }): Promise<User> => {
    return apiClient.post<User>('/users', data)
  },

  update: (id: string, data: Partial<User>): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`)
  },

  updateRole: (id: string, role: User['role']): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/role`, { role })
  },
}
