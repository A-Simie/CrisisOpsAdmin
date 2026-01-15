import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi } from '../api/auth'
import { apiClient } from '../api/client'
import type { User } from '../types/api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: () => void
    logout: () => Promise<void>
    updateUser: (user: User) => void
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isAuthenticated = !!user

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            const userData = await authApi.getProfile()
            setUser(userData)
        } catch {
            apiClient.clearTokens()
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    useEffect(() => {
        const handleLogout = () => {
            setUser(null)
            apiClient.clearTokens()
        }

        window.addEventListener('auth:logout', handleLogout)
        return () => window.removeEventListener('auth:logout', handleLogout)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const accessToken = params.get('accessToken')

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            window.history.replaceState({}, '', '/')
            fetchUser()
        }
    }, [fetchUser])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await authApi.login({ email, password })
            localStorage.setItem('accessToken', response.accessToken)
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken)
            }
            setUser(response.user)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed'
            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const loginWithGoogle = () => {
        window.location.href = authApi.getGoogleAuthUrl()
    }

    const logout = async () => {
        try {
            await authApi.logout()
        } catch {
            // Ignore errors on logout
        } finally {
            setUser(null)
            apiClient.clearTokens()
        }
    }

    const clearError = () => setError(null)

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                error,
                login,
                loginWithGoogle,
                logout,
                updateUser,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
