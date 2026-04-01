import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Shield,
    Mail,
    Lock,
    LogIn,
    Clock,
    AlertTriangle,
    Heart,
    Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
    const navigate = useNavigate()
    const { login, loginWithGoogle, error, clearError, isLoading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [localError, setLocalError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError('')
        clearError()

        if (!email || !password) {
            setLocalError('Please enter email and password')
            return
        }

        try {
            await login(email, password)
            navigate('/')
        } catch {
            // Error is handled by context
        }
    }

    const displayError = localError || error

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <div className="flex flex-col flex-1 w-full lg:max-w-[600px] h-full bg-white dark:bg-background-dark border-r border-gray-200 dark:border-border-dark relative z-10 overflow-y-auto">
                <div className="p-8 lg:p-12 flex items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 bg-primary/20 rounded-lg text-primary">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                CrisisOps Admin
                            </h1>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Official Use Only
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center flex-1 px-8 lg:px-20 pb-12">
                    <div className="mb-10">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            Sign in to your workspace
                        </h2>
                        <p className="text-gray-600 dark:text-[#9ca4ba] text-lg">
                            Enter your credentials to access the incident command center.
                        </p>
                    </div>

                    {displayError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-400 text-sm">{displayError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@agency.gov"
                                    disabled={isLoading}
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9ca4ba] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Password
                                </label>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-primary hover:text-blue-400 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9ca4ba] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-4 h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    Secure Sign In
                                </>
                            )}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-border-dark" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-background-dark text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={loginWithGoogle}
                            disabled={isLoading}
                            className="h-14 bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-[#252a33] text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-border-dark text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <a href="#" className="text-primary font-medium hover:underline">
                                Request Access
                            </a>
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Authorized access only. All activities are monitored.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 relative bg-slate-100 dark:bg-surface-dark">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Satellite view of earth global map network connection"
                        className="w-full h-full object-cover opacity-40 dark:opacity-60"
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/80 to-primary/5 dark:from-background-dark dark:via-background-dark/80 dark:to-primary/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-transparent to-transparent dark:from-background-dark" />
                </div>

                <div className="relative z-10 flex flex-col justify-end p-16 w-full max-w-2xl">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                System Status: Operational
                            </span>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                            Coordinating response,
                            <br />
                            <span className="text-primary">saving lives.</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md leading-relaxed">
                            The Global Incident Management System provides real-time data and
                            resource allocation for rapid disaster response.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 dark:bg-surface-dark/40 backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-4 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-red-500/20 text-red-500 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">Active Incidents</span>
                            </div>
                            {/* <span className="text-2xl font-bold text-slate-900 dark:text-white">1,248</span> */}
                        </div>
                        <div className="bg-white/60 dark:bg-surface-dark/40 backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-4 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                                    <Heart className="h-5 w-5" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">Units Deployed</span>
                            </div>
                            {/* <span className="text-2xl font-bold text-slate-900 dark:text-white">8,902</span> */}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-6 text-xs text-slate-500 dark:text-gray-400 font-mono">
                        <span>v4.2.0 (Stable)</span>
                        <span>Server: US-EAST-1</span>
                        <span>Latency: 24ms</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
