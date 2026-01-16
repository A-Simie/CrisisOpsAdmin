// Role hierarchy (higher number = more permissions)
export const UserRole = {
  CITIZEN: 'CITIZEN',
  RESPONDER: 'RESPONDER',
  DISPATCHER: 'DISPATCHER',
  ORG_ADMIN: 'ORG_ADMIN',
  GOV_ADMIN: 'GOV_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  CITIZEN: 0,
  RESPONDER: 1,
  DISPATCHER: 2,
  ORG_ADMIN: 3,
  GOV_ADMIN: 4,
  SUPER_ADMIN: 5,
}

// Check if user has minimum required role
export function hasMinimumRole(userRole: UserRoleType, minRole: UserRoleType): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

// Get roles that a user can create (only roles below their own, excluding CITIZEN)
export function getCreatableRoles(userRole: UserRoleType): UserRoleType[] {
  const myLevel = ROLE_HIERARCHY[userRole]
  return Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => level < myLevel && role !== 'CITIZEN')
    .sort((a, b) => b[1] - a[1]) // Sort by level descending
    .map(([role]) => role as UserRoleType)
}

// Check if user can create a specific role
export function canCreateRole(userRole: UserRoleType, targetRole: UserRoleType): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole] && targetRole !== 'CITIZEN'
}

// Human-readable role labels
export const ROLE_LABELS: Record<UserRoleType, string> = {
  CITIZEN: 'Citizen',
  RESPONDER: 'Responder',
  DISPATCHER: 'Dispatcher',
  ORG_ADMIN: 'Organization Admin',
  GOV_ADMIN: 'Government Admin',
  SUPER_ADMIN: 'Super Admin',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  profilePicture?: string
  role: UserRoleType
  orgId?: string
  createdAt: string
  updatedAt?: string
}

export interface Organization {
  id: string
  name: string
  type: string
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  contactEmail: string
  contactPhone: string
  headquarters: {
    address: string
    city: string
    state: string
    latitude: number
    longitude: number
  }
  serviceArea: {
    states: string[]
    cities: string[]
    radiusKm?: number
  }
  isActive: boolean
  settings?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  type: string
  description: string
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'ACTIVE' | 'RESPONDING' | 'RESOLVED'
  reportedBy?: string
  assignedTo?: string
  organizationId?: string
  notes?: IncidentNote[]
  mediaUrls?: string[]
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface IncidentNote {
  id: string
  content: string
  createdBy: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface IncidentFilters {
  status?: string
  severity?: string
  type?: string
  organizationId?: string
  page?: number
  limit?: number
}

export interface NearbyIncidentsParams {
  latitude: number
  longitude: number
  radius?: number
}
