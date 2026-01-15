import { apiClient } from './client'
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
} from '../types/api'

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
  },

  register: (data: RegisterRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/register', data, { skipAuth: true })
  },

  refreshToken: (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post('/auth/refresh', { refreshToken }, { skipAuth: true })
  },

  logout: (): Promise<void> => {
    return apiClient.post('/auth/logout')
  },

  logoutAll: (): Promise<void> => {
    return apiClient.post('/auth/logout-all')
  },

  getProfile: (): Promise<User> => {
    return apiClient.get<User>('/auth/me')
  },

  updateProfile: (data: FormData): Promise<User> => {
    return apiClient.patch<User>('/auth/profile', data)
  },

  getGoogleAuthUrl: (): string => {
    return apiClient.getGoogleAuthUrl()
  },
}
