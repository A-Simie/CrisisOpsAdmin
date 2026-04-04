import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Bell,
    Key as KeyIcon,
    LogOut,
    Activity,
    Clock,
    CheckCircle,
    Palette,
    Volume2,
    Lock as LockIcon,
    Smartphone,
    Moon,
    Sun,
    Monitor,
    Copy,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X as XIcon,
    AlertCircle,
    RotateCw,
} from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

type SettingsTab = 'notifications' | 'security' | 'display' | 'api-keys'

export function ProfilePage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState<SettingsTab>('notifications')

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.lastName || 'User'
    const initials = user?.firstName && user?.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user?.firstName?.[0] || user?.lastName?.[0] || 'U'
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A'

    const settingsTabs = [
        { id: 'notifications' as SettingsTab, icon: Bell, label: 'Notifications' },
        { id: 'security' as SettingsTab, icon: Shield, label: 'Security' },
        { id: 'display' as SettingsTab, icon: Palette, label: 'Display' },
        { id: 'api-keys' as SettingsTab, icon: KeyIcon, label: 'API Keys' },
    ]

    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Header Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card-dark p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={fullName}
                                        className="size-24 rounded-full ring-4 ring-slate-50 dark:ring-slate-700 object-cover"
                                    />
                                ) : (
                                    <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 ring-4 ring-slate-50 dark:ring-slate-700 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-600 dark:text-slate-300">
                                            {initials}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate('/profile/edit')}
                                    className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                </button>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-1">{fullName}</h1>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                    {user?.role || 'User'}
                                </span>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{user?.email || 'No email'}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card-dark p-6">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Activity Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard icon={Activity} value="124" label="Incidents" color="primary" />
                            <StatCard icon={CheckCircle} value="98%" label="Resolved" color="emerald" />
                            <StatCard icon={Clock} value="4.2m" label="Avg. Response" color="amber" />
                            <StatCard icon={Calendar} value="32" label="This Month" color="violet" />
                        </div>
                    </div>

                    {/* Sign Out (Desktop Only) */}
                    <div className="hidden lg:block">
                        <SignOutCard onLogout={handleLogout} />
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card-dark overflow-hidden min-h-[600px]">
                        {/* Settings Tabs Header */}
                        <div className="border-b border-slate-200 dark:border-slate-800">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                {settingsTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${activeTab === tab.id
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="p-0">
                            {activeTab === 'notifications' && <NotificationsSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                            {activeTab === 'display' && <DisplaySettings theme={theme} toggleTheme={toggleTheme} />}
                            {activeTab === 'api-keys' && <ApiKeysSettings />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sign Out (Mobile Only - Bottom) */}
            <div className="lg:hidden">
                <SignOutCard onLogout={handleLogout} />
            </div>
        </div>
    )
}

function SignOutCard({ onLogout }: { onLogout: () => void }) {
    return (
        <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <LogOut className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Sign Out</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">End your current session</p>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}

function NotificationsSettings() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notification Preferences</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage how you receive alerts</p>
            </div>

            <section>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    Incident Alerts
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                    <SettingsToggle title="High Priority Incidents" description="Push notifications for Grade A/B incidents" defaultChecked />
                    <SettingsToggle title="SMS Alerts" description="Receive text messages when offline" />
                    <SettingsToggle title="Daily Email Digest" description="Summary of closed incidents in your region" defaultChecked />
                </div>
            </section>

            <section>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Contact Methods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alert Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm pl-10 pr-3 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMS Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="+1 234 567 8900"
                                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm pl-10 pr-3 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <SaveButtons />
        </div>
    )
}

function SecuritySettings() {
    const { user } = useAuth()
    const [flow, setFlow] = useState<'idle' | 'confirming' | 'resetting'>('idle')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    const [cooldown, setCooldown] = useState(0)
    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        if (cooldown > 0) {
            timerRef.current = window.setInterval(() => {
                setCooldown((prev) => prev - 1)
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [cooldown])

    const passwordRules = [
        { label: 'At least 8 characters long', test: (p: string) => p.length >= 8 },
        { label: 'Include at least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Include at least one number', test: (p: string) => /[0-9]/.test(p) },
        { label: 'Include at least one special character', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
    ]

    const isValid = otp.length === 6 &&
                    passwordRules.every(rule => rule.test(newPassword)) && 
                    newPassword === confirmPassword && 
                    newPassword !== ''

    const handleInitiateReset = async () => {
        if (!user?.email) return
        
        setIsProcessing(true)
        setError(null)
        try {
            await authApi.forgotPassword({ email: user.email })
            setFlow('resetting')
            setCooldown(60)
            setSuccess('Verification code sent to your email.')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send verification code')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleFinalReset = async () => {
        if (!isValid || !user?.email) return
        
        setIsProcessing(true)
        setError(null)
        setSuccess(null)

        try {
            await authApi.resetPassword({
                email: user.email,
                otp,
                password: newPassword
            })
            setSuccess('Password reset successfully!')
            setFlow('idle')
            setOtp('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleResendOtp = async () => {
        if (cooldown > 0 || !user?.email) return
        setIsProcessing(true)
        try {
            await authApi.forgotPassword({ email: user.email })
            setCooldown(60)
            setSuccess('A new code has been sent.')
        } catch (err) {
            setError('Failed to resend code.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Security Settings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage password and authentication</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                </div>
            )}

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <LockIcon className="h-4 w-4 text-primary" />
                        Password Management
                    </h4>
                </div>

                {flow === 'idle' && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">Reset Account Password</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                                Securely reset your password using a one-time verification code sent to your email.
                            </p>
                        </div>
                        <button 
                            onClick={() => setFlow('confirming')}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            Initiate Reset
                        </button>
                    </div>
                )}

                {flow === 'confirming' && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border-2 border-primary/20 flex flex-col items-center text-center gap-4">
                        <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-lg">Are you absolutely sure?</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                We will send a 6-digit verification code to <span className="font-bold text-slate-700 dark:text-slate-300">{user?.email}</span> to authorize this password reset.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 w-full max-w-xs">
                            <button 
                                onClick={() => setFlow('idle')}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleInitiateReset}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Send Code"}
                            </button>
                        </div>
                    </div>
                )}

                {flow === 'resetting' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Verification Code</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="Enter 6-digit code" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-center tracking-[0.5em] text-lg px-4 focus:ring-2 focus:ring-primary transition-all" 
                                />
                                <button 
                                    onClick={handleResendOtp}
                                    disabled={cooldown > 0 || isProcessing}
                                    className="px-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {cooldown > 0 ? (
                                        <span className="text-primary font-mono">{cooldown}s</span>
                                    ) : (
                                        <RotateCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                                    )}
                                    Resend
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showNew ? "text" : "password"} 
                                        placeholder="Enter new password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm px-4 focus:ring-2 focus:ring-primary transition-all pr-11" 
                                    />
                                    <button 
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirm ? "text" : "password"} 
                                        placeholder="Confirm new password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm px-4 focus:ring-2 focus:ring-primary transition-all pr-11" 
                                    />
                                    <button 
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Rules */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-3">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password Requirements</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {passwordRules.map((rule, idx) => {
                                    const isMet = rule.test(newPassword)
                                    return (
                                        <div key={idx} className="flex items-center gap-2 text-sm transition-colors">
                                            <div className={`p-0.5 rounded-full ${isMet ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                {isMet ? <Check className="h-3 w-3" /> : <div className="h-3 w-3" />}
                                            </div>
                                            <span className={isMet ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            {newPassword && confirmPassword && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className={`p-0.5 rounded-full ${newPassword === confirmPassword ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-400'}`}>
                                            {newPassword === confirmPassword ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                                        </div>
                                        <span className={newPassword === confirmPassword ? 'text-slate-700 dark:text-slate-300' : 'text-red-400'}>
                                            Passwords match
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <button 
                                onClick={() => {
                                    setFlow('idle')
                                    setOtp('')
                                    setNewPassword('')
                                    setConfirmPassword('')
                                    setError(null)
                                    setSuccess(null)
                                }}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleFinalReset}
                                disabled={!isValid || isProcessing}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-blue-600 shadow-lg shadow-primary/25 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="size-4" />
                                        Complete Reset
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    Two-Factor Authentication
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                    <SettingsToggle title="SMS Authentication" description="Receive a code via SMS when signing in" defaultChecked />
                    <SettingsToggle title="Authenticator App" description="Use an authenticator app like Google Authenticator" />
                </div>
            </section>
        </div>
    )
}

function DisplaySettings({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Display Settings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize the appearance</p>
            </div>

            <section>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Theme
                </h4>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center justify-center h-12 mb-3 rounded-lg bg-white border border-slate-200">
                            <Sun className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Light</p>
                    </button>
                    <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center justify-center h-12 mb-3 rounded-lg bg-slate-900 border border-slate-700">
                            <Moon className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Dark</p>
                    </button>
                    <button className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-center h-12 mb-3 rounded-lg bg-gradient-to-r from-white to-slate-900 border border-slate-200">
                            <Monitor className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">System</p>
                    </button>
                </div>
            </section>
        </div>
    )
}

function ApiKeysSettings() {
    const apiKeys = [
        { name: 'Production API Key', key: 'cops_live_xxxxxxxxxxxx', created: 'Jan 15, 2024' },
        { name: 'Development Key', key: 'cops_test_xxxxxxxxxxxx', created: 'Dec 3, 2023' },
    ]

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">API Keys</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage API keys for integrations</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                    <Plus className="h-4 w-4" />
                    Create Key
                </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                {apiKeys.map((apiKey, index) => (
                    <div key={index} className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">{apiKey.name}</p>
                            <p className="text-sm text-slate-500 font-mono truncate">{apiKey.key}</p>
                            <p className="text-xs text-slate-400 mt-1">Created: {apiKey.created}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                <Copy className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: 'primary' | 'emerald' | 'amber' | 'violet' }) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    }

    return (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className={`inline-flex p-2.5 rounded-xl ${colorClasses[color]} mb-2`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    )
}

function SettingsToggle({ title, description, defaultChecked = false }: { title: string; description: string; defaultChecked?: boolean }) {
    return (
        <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">{title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-300 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
        </div>
    )
}

function SaveButtons() {
    return (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                Cancel
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-md shadow-primary/25 transition-all active:scale-95 text-sm">
                Save Changes
            </button>
        </div>
    )
}
