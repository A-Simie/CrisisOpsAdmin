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

// Incident status enum matching backend
export const IncidentStatus = {
  REPORTED: 'REPORTED',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  FALSE_ALARM: 'FALSE_ALARM',
} as const

export type IncidentStatusType = typeof IncidentStatus[keyof typeof IncidentStatus]

// Hazard type enum matching backend
export const HazardType = {
  FLOOD: 'FLOOD',
  FIRE: 'FIRE',
  EARTHQUAKE: 'EARTHQUAKE',
  STORM: 'STORM',
  LANDSLIDE: 'LANDSLIDE',
  DROUGHT: 'DROUGHT',
  EPIDEMIC: 'EPIDEMIC',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  SECURITY: 'SECURITY',
  ACCIDENT: 'ACCIDENT',
  OTHER: 'OTHER',
} as const

export type HazardTypeType = typeof HazardType[keyof typeof HazardType]

// Severity enum
export const IncidentSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export type IncidentSeverityType = typeof IncidentSeverity[keyof typeof IncidentSeverity]

export interface IncidentMedia {
  url: string
  type: 'IMAGE' | 'VIDEO'
  caption?: string
}

export interface Incident {
  id: string
  reporterId: string
  primaryOrgId: string | null
  hazardType: HazardTypeType
  severity: IncidentSeverityType
  status: IncidentStatusType
  title: string
  description: string
  location: {
    latitude: number
    longitude: number
    address: string | null
    city: string | null
    state: string | null
  }
  media: IncidentMedia[]
  estimatedAffectedCount: number
  communityConfirmations: number
  responseTimeMinutes: number | null
  createdAt: string
  updatedAt: string
}

export interface IncidentNote {
  orgId: string
  note: string
  createdBy: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CheckEmailResponse {
  exists: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface VerifyEmailRequest {
  email: string
  otp: string
}

export interface VerifyEmailResponse {
  message: string
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

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  password: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
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

// Cursor-based pagination for incidents
export interface CursorPaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface IncidentFilters {
  cursor?: string
  limit?: number
  hazardType?: HazardTypeType
  severity?: IncidentSeverityType
  status?: IncidentStatusType
  city?: string
  state?: string
  orgId?: string
  startDate?: string
  endDate?: string
}

export interface NearbyIncidentsParams {
  latitude: number
  longitude: number
  radiusKm?: number
  hazardType?: HazardTypeType
  severity?: IncidentSeverityType
  excludeResolved?: boolean
  limit?: number
}

