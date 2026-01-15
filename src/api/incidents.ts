import { apiClient } from './client'
import type { Incident, IncidentFilters, NearbyIncidentsParams, PaginatedResponse, IncidentNote } from '../types/api'

export const incidentsApi = {
  getAll: (filters?: IncidentFilters): Promise<PaginatedResponse<Incident>> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value))
      })
    }
    const query = params.toString()
    return apiClient.get<PaginatedResponse<Incident>>(`/incidents${query ? `?${query}` : ''}`)
  },

  getById: (id: string): Promise<Incident> => {
    return apiClient.get<Incident>(`/incidents/${id}`)
  },

  create: (data: Partial<Incident>): Promise<Incident> => {
    return apiClient.post<Incident>('/incidents', data)
  },

  update: (id: string, data: Partial<Incident>): Promise<Incident> => {
    return apiClient.patch<Incident>(`/incidents/${id}`, data)
  },

  updateStatus: (id: string, status: Incident['status']): Promise<Incident> => {
    return apiClient.patch<Incident>(`/incidents/${id}/status`, { status })
  },

  assign: (id: string, organizationId: string): Promise<Incident> => {
    return apiClient.post<Incident>(`/incidents/${id}/assign`, { organizationId })
  },

  addNote: (id: string, content: string): Promise<IncidentNote> => {
    return apiClient.post<IncidentNote>(`/incidents/${id}/notes`, { content })
  },

  confirm: (id: string): Promise<Incident> => {
    return apiClient.post<Incident>(`/incidents/${id}/confirm`)
  },

  getNearby: (params: NearbyIncidentsParams): Promise<Incident[]> => {
    const query = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      ...(params.radius && { radius: String(params.radius) }),
    }).toString()
    return apiClient.get<Incident[]>(`/incidents/nearby?${query}`)
  },
}
