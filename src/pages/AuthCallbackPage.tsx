import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthCallbackPage() {
    const navigate = useNavigate()
    const { isAuthenticated, isInitializing } = useAuth()

    useEffect(() => {
        if (!isInitializing) {
            if (isAuthenticated) {
                navigate('/', { replace: true })
            } else {
                navigate('/login', { replace: true })
            }
        }
    }, [isAuthenticated, isInitializing, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 dark:text-gray-400">Completing sign in...</span>
            </div>
        </div>
    )
}
