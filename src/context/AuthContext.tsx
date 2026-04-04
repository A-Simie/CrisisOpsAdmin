import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { User } from '../types/api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    isInitializing: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: (email?: string) => Promise<void>
    logout: () => Promise<void>
    updateUser: (user: User) => void
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isAuthenticated = !!user

    const fetchUser = useCallback(async () => {
        try {
            const userData = await authApi.getProfile()
            setUser(userData)
        } catch {
            setUser(null)
        } finally {
            setIsInitializing(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    useEffect(() => {
        const handleLogout = () => {
            setUser(null)
        }

        window.addEventListener('auth:logout', handleLogout)
        return () => window.removeEventListener('auth:logout', handleLogout)
    }, [])

    // Synchronize with URL-based token if redirected from backend (Google Login)
    // Even though we use cookies, the backend transmits the initial accessToken 
    // in the URL for the first redirect.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const accessToken = params.get('accessToken')

        if (accessToken) {
            // We clear the URL immediately. The cookies (refreshToken) are 
            // already set by the backend, so we just trigger a fetchUser.
            window.history.replaceState({}, '', '/')
            fetchUser()
        }
    }, [fetchUser])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Step 1: Pre-authentication Email Check
            await authApi.checkEmail(email)

            // Step 2: Standard Login
            const response = await authApi.login({ email, password })
            
            // Tokens are set via HTTP-only cookies in the backend response
            setUser(response.user)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed'
            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const loginWithGoogle = async (email?: string) => {
        setIsLoading(true)
        setError(null)

        try {
            if (!email) {
                throw new Error('Please enter your email to proceed with Google Login')
            }

            // Step 1: Pre-authentication Email Check
            await authApi.checkEmail(email)

            // Step 2: Redirect to Google OAuth Flow
            window.location.href = authApi.getGoogleAuthUrl()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Google login initiation failed'
            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await authApi.logout()
        } catch {
            // Ignore errors on logout
        } finally {
            setUser(null)
            setIsLoading(false)
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
                isInitializing,
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
