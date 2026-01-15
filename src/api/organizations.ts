import { apiClient } from './client'
import type { Organization } from '../types/api'

export const organizationsApi = {
  getAll: (): Promise<Organization[]> => {
    return apiClient.get<Organization[]>('/organizations')
  },

  getById: (id: string): Promise<Organization> => {
    return apiClient.get<Organization>(`/organizations/${id}`)
  },

  create: (data: Partial<Organization>): Promise<Organization> => {
    return apiClient.post<Organization>('/organizations', data)
  },

  updateSettings: (id: string, settings: Record<string, unknown>): Promise<Organization> => {
    return apiClient.patch<Organization>(`/organizations/${id}/settings`, { settings })
  },

  activate: (id: string): Promise<Organization> => {
    return apiClient.patch<Organization>(`/organizations/${id}/activate`)
  },

  deactivate: (id: string): Promise<Organization> => {
    return apiClient.patch<Organization>(`/organizations/${id}/deactivate`)
  },
}
