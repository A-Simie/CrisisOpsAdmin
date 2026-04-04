const IS_LIVE = import.meta.env.VITE_IS_LIVE === 'true'
const API_BASE_URL = IS_LIVE
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.VITE_API_BASE_URL_LOCAL || import.meta.env.VITE_API_BASE_URL)

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing) return refreshPromise!

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
      })

      return response.ok
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuth = false, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Only set application/json if not sending FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // NOTE: Authorization header is handled via HTTP-only cookies (credentials: 'include')
  let response = await fetch(url, { ...fetchOptions, headers, credentials: 'include' })

  // If 401 and not skipping auth, attempt a refresh
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/refresh')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry the original request
      response = await fetch(url, { ...fetchOptions, headers, credentials: 'include' })
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
  return `${API_BASE_URL}/auth/google?from=admin&action=login`
}

export const apiClient = {
  get,
  post,
  patch,
  delete: del,
  getGoogleAuthUrl,
}
