const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

const getAccessToken = (): string | null => localStorage.getItem('accessToken')
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken')

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

const clearTokens = (): void => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const data = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuth = false, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  }

  // Only set application/json if not sending FormData
  if (!(fetchOptions.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  let response = await fetch(url, { ...fetchOptions, headers })

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newToken = getAccessToken()
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
      }
      response = await fetch(url, { ...fetchOptions, headers })
    } else {
      window.dispatchEvent(new CustomEvent('auth:logout'))
      throw new Error('Session expired. Please log in again.')
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  const json = await response.json()
  
  // Backend wraps responses in { success, message, data }
  // Unwrap the data field if present
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  
  return json as T
}

const get = <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

const post = <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
  })
}

const patch = <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
  })
}

const del = <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, { ...options, method: 'DELETE' })
}

const getGoogleAuthUrl = (): string => {
  return `${API_BASE_URL}/auth/google`
}

export const apiClient = {
  get,
  post,
  patch,
  delete: del,
  clearTokens,
  getGoogleAuthUrl,
}
