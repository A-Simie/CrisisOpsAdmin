import { apiClient } from './client'
import type {
  User,
  LoginRequest,
  LoginResponse,
  CheckEmailResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RegisterRequest,
  RefreshTokenResponse,
  UpdatePasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
} from '../types/api'

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
  },

  checkEmail: (email: string): Promise<CheckEmailResponse> => {
    return apiClient.post<CheckEmailResponse>('/auth/check-email', { email }, { skipAuth: true })
  },

  verifyEmail: (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    return apiClient.post<VerifyEmailResponse>('/auth/verify-email', data, { skipAuth: true })
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

  updatePassword: (data: UpdatePasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/update-password', data)
  },

  resendVerification: (data: ResendVerificationRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/resend-verification', data, { skipAuth: true })
  },

  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/reset-password', data, { skipAuth: true })
  },

  forgotPassword: (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/forgot-password', data, { skipAuth: true })
  },
}
