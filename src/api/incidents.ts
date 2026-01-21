import { apiClient } from './client'
import type { Incident, IncidentFilters, NearbyIncidentsParams, CursorPaginatedResponse, IncidentStatusType } from '../types/api'


export const incidentsApi = {
  getAll: (filters?: IncidentFilters): Promise<CursorPaginatedResponse<Incident>> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value))
      })
    }
    const query = params.toString()
    // apiClient unwraps the data field, so we receive the incidents array directly
    return apiClient.get<Incident[]>(`/incidents${query ? `?${query}` : ''}`).then(incidents => ({
      data: Array.isArray(incidents) ? incidents : [],
      nextCursor: null,
      hasMore: false,
    }))
  },

  getById: (id: string): Promise<Incident> => {
    return apiClient.get<Incident>(`/incidents/${id}`)
  },

  create: (data: {
    hazardType: string
    title: string
    description: string
    location: { latitude: number; longitude: number; address?: string; city?: string; state?: string }
    severity?: string
    estimatedAffectedCount?: number
    media?: { url: string; type: 'IMAGE' | 'VIDEO'; caption?: string }[]
  }): Promise<Incident> => {
    return apiClient.post<Incident>('/incidents', data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() }
    })
  },

  update: (id: string, data: Partial<{ title: string; description: string; severity: string; estimatedAffectedCount: number }>): Promise<Incident> => {
    return apiClient.patch<Incident>(`/incidents/${id}`, data)
  },

  updateStatus: (id: string, status: IncidentStatusType, note?: string): Promise<Incident> => {
    return apiClient.patch<Incident>(`/incidents/${id}/status`, { status, note }, {
      headers: { 'Idempotency-Key': crypto.randomUUID() }
    })
  },

  assign: (id: string, orgId: string, isPrimary = false): Promise<Incident> => {
    return apiClient.post<Incident>(`/incidents/${id}/assign`, { orgId, isPrimary })
  },



  addNote: (id: string, note: string): Promise<Incident> => {
    return apiClient.post<Incident>(`/incidents/${id}/notes`, { note })
  },

  confirm: (id: string): Promise<Incident> => {
    return apiClient.post<Incident>(`/incidents/${id}/confirm`)
  },

  getNearby: (params: NearbyIncidentsParams): Promise<Incident[]> => {
    const query = new URLSearchParams()
    query.append('latitude', String(params.latitude))
    query.append('longitude', String(params.longitude))
    if (params.radiusKm) query.append('radiusKm', String(params.radiusKm))
    if (params.hazardType) query.append('hazardType', params.hazardType)
    if (params.severity) query.append('severity', params.severity)
    if (params.excludeResolved !== undefined) query.append('excludeResolved', String(params.excludeResolved))
    if (params.limit) query.append('limit', String(params.limit))
    return apiClient.get<Incident[]>(`/incidents/nearby?${query.toString()}`)
  },
}

