import { useState, useEffect, useRef } from 'react'
import {
    Building2,
    Bell,
    Shield,
    Palette,
    Key as KeyIcon,
    Volume2,
    Mail,
    Phone,
    Lock as LockIcon,
    Smartphone,
    Globe as GlobeIcon,
    Moon,
    Sun,
    Monitor,
    Copy,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Check,
    CheckCircle,
    AlertCircle,
    RotateCw,
    X as XIcon,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

type SettingsTab = 'organization' | 'notifications' | 'security' | 'display' | 'api-keys'

const navItems: { icon: any; label: string; tab: SettingsTab }[] = [
    { icon: Building2, label: 'Organization', tab: 'organization' },
    { icon: Bell, label: 'Notifications', tab: 'notifications' },
    { icon: Shield, label: 'Security', tab: 'security' },
    { icon: Palette, label: 'Display', tab: 'display' },
    { icon: KeyIcon, label: 'API Keys', tab: 'api-keys' },
]

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('notifications')
    const [showSidebar, setShowSidebar] = useState(false)

    return (
        <div className="flex flex-1 flex-col md:flex-row h-full overflow-hidden -m-4 lg:-m-8">
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-72 md:relative md:z-auto border-r border-slate-200 dark:border-[#282d39] bg-white dark:bg-background-dark flex flex-col overflow-y-auto transform transition-transform duration-300 md:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 aspect-square rounded-full size-12 flex items-center justify-center border border-slate-600 shadow-lg">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                                    Settings
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
                                    Manage preferences
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {navItems.map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => {
                                    setActiveTab(item.tab)
                                    setShowSidebar(false)
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.tab
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${activeTab === item.tab ? '' : 'text-slate-400'}`} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[#0f121a] relative">
                <div className="md:hidden p-4 pb-0">
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-[#282d39] text-slate-700 dark:text-white text-sm font-medium"
                    >
                        <Eye className="h-4 w-4" />
                        {navItems.find(n => n.tab === activeTab)?.label}
                    </button>
                </div>

                <div className="max-w-4xl mx-auto w-full pb-20">
                    {activeTab === 'notifications' && <NotificationsSettings />}
                    {activeTab === 'organization' && <OrganizationSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'display' && <DisplaySettings />}
                    {activeTab === 'api-keys' && <ApiKeysSettings />}
                </div>
            </main>
        </div>
    )
}

function NotificationsSettings() {
    return (
        <>
            <div className="px-4 md:px-10 py-8 border-b border-slate-200 dark:border-[#282d39]">
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                    Notification Preferences
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                    Manage how you receive alerts about incidents and hazard pack updates.
                </p>
            </div>

            <div className="px-4 md:px-10 py-6 flex flex-col gap-8">
                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-primary" />
                        Incident Alerts
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] divide-y divide-slate-200 dark:divide-[#282d39]">
                        <SettingsToggle
                            title="High Priority Incidents"
                            description="Immediate push notifications for Grade A/B incidents."
                            defaultChecked
                        />
                        <SettingsToggle
                            title="SMS Alerts"
                            description="Receive text messages when offline."
                        />
                        <SettingsToggle
                            title="Daily Email Digest"
                            description="Summary of all closed incidents in your region."
                            defaultChecked
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Contact Methods
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-[#282d39] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Alert Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    defaultValue="admin@reliefops.org"
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm pl-10 py-2.5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                SMS Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    defaultValue="+234 801 234 5678"
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm pl-10 py-2.5"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <SaveButtons />
            </div>
        </>
    )
}

function OrganizationSettings() {
    return (
        <>
            <div className="px-4 md:px-10 py-8 border-b border-slate-200 dark:border-[#282d39]">
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                    Organization Settings
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                    Manage your organization's profile and team members.
                </p>
            </div>

            <div className="px-4 md:px-10 py-6 flex flex-col gap-8">
                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Organization Profile
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-[#282d39] p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Organization Name
                            </label>
                            <input
                                type="text"
                                defaultValue="Lagos State Emergency Management Agency"
                                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Region
                                </label>
                                <div className="relative">
                                    <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <select className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 pl-10 pr-3">
                                        <option>Lagos State</option>
                                        <option>Abuja FCT</option>
                                        <option>Kano State</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Primary Contact
                                </label>
                                <input
                                    type="email"
                                    defaultValue="ops@lasema.gov.ng"
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <SaveButtons />
            </div>
        </>
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
        <>
            <div className="px-4 md:px-10 py-8 border-b border-slate-200 dark:border-[#282d39]">
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                    Security Settings
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                    Manage your account security and authentication methods.
                </p>
            </div>

            <div className="px-4 md:px-10 py-6 flex flex-col gap-8">
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
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                            <LockIcon className="h-5 w-5 text-primary" />
                            Password Management
                        </h3>
                    </div>

                    {flow === 'idle' && (
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-10 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-6">
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Reset Account Password</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                                    Trigger a secure password reset via email verification. This will use the email associated with your account.
                                </p>
                            </div>
                            <button 
                                onClick={() => setFlow('confirming')}
                                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-xl shadow-primary/25 transition-all active:scale-95"
                            >
                                Initiate Reset Flow
                            </button>
                        </div>
                    )}

                    {flow === 'confirming' && (
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-10 border-2 border-primary/20 flex flex-col items-center text-center gap-6">
                            <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Authorise Password Reset?</h4>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                                    We will send a 6-digit code to <span className="font-bold text-slate-700 dark:text-slate-200">{user?.email}</span>. You will need this code to complete the reset.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 w-full max-w-sm">
                                <button 
                                    onClick={() => setFlow('idle')}
                                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleInitiateReset}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-xl shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-3 lg-transition"
                                >
                                    {isProcessing ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & Send"}
                                </button>
                            </div>
                        </div>
                    )}

                    {flow === 'resetting' && (
                        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Verification Code</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            placeholder="000000" 
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-center tracking-[0.75em] text-2xl focus:border-primary focus:ring-0 transition-all outline-none" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleResendOtp}
                                        disabled={cooldown > 0 || isProcessing}
                                        className="px-6 h-14 rounded-xl border border-slate-200 dark:border-slate-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-sm"
                                    >
                                        {cooldown > 0 ? (
                                            <span className="text-primary font-mono text-lg">{cooldown}s</span>
                                        ) : (
                                            <RotateCw className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
                                        )}
                                        Resend Code
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNew ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary px-4 pr-12 text-lg" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirm ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary px-4 pr-12 text-lg" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Rules */}
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 space-y-4">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Security Requirements</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {passwordRules.map((rule, idx) => {
                                        const isMet = rule.test(newPassword)
                                        return (
                                            <div key={idx} className="flex items-center gap-3 text-sm transition-colors">
                                                <div className={`p-1 rounded-full ${isMet ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                                    {isMet ? <Check className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5" />}
                                                </div>
                                                <span className={isMet ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                                                    {rule.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {newPassword && confirmPassword && (
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`p-1 rounded-full ${newPassword === confirmPassword ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-400'}`}>
                                                {newPassword === confirmPassword ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                                            </div>
                                            <span className={newPassword === confirmPassword ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-red-400'}>
                                                Passwords match
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setFlow('idle')
                                        setOtp('')
                                        setNewPassword('')
                                        setConfirmPassword('')
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleFinalReset}
                                    disabled={!isValid || isProcessing}
                                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 shadow-xl shadow-primary/25 transition-all active:scale-95 text-base disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Authorising...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="size-5" />
                                            Complete Reset
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Two-Factor Authentication
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] divide-y divide-slate-200 dark:divide-[#282d39]">
                        <SettingsToggle
                            title="SMS Authentication"
                            description="Receive a code via SMS when signing in."
                            defaultChecked
                        />
                        <SettingsToggle
                            title="Authenticator App"
                            description="Use an authenticator app like Google Authenticator."
                        />
                    </div>
                </section>
            </div>
        </>
    )
}

function DisplaySettings() {
    const { theme, toggleTheme } = useTheme()

    return (
        <>
            <div className="px-4 md:px-10 py-8 border-b border-slate-200 dark:border-[#282d39]">
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                    Display Settings
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                    Customize the appearance of your dashboard.
                </p>
            </div>

            <div className="px-4 md:px-10 py-6 flex flex-col gap-8">
                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Theme
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => theme === 'dark' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 dark:border-[#282d39] hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center justify-center h-16 mb-3 rounded-lg bg-white border border-slate-200">
                                <Sun className="h-8 w-8 text-amber-500" />
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white">Light</p>
                        </button>
                        <button
                            onClick={() => theme === 'light' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 dark:border-[#282d39] hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center justify-center h-16 mb-3 rounded-lg bg-slate-900 border border-slate-700">
                                <Moon className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white">Dark</p>
                        </button>
                        <button className="p-4 rounded-xl border-2 border-slate-200 dark:border-[#282d39] hover:border-slate-300 dark:hover:border-slate-600 transition-all opacity-50 cursor-not-allowed">
                            <div className="flex items-center justify-center h-16 mb-3 rounded-lg bg-gradient-to-r from-white to-slate-900 border border-slate-200">
                                <Monitor className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white">System</p>
                        </button>
                    </div>
                </section>

                <SaveButtons />
            </div>
        </>
    )
}

function ApiKeysSettings() {
    const apiKeys = [
        { name: 'Production API Key', key: 'rops_live_xxxxxxxxxxxx', created: 'Jan 15, 2024' },
        { name: 'Development Key', key: 'rops_test_xxxxxxxxxxxx', created: 'Dec 3, 2023' },
    ]

    return (
        <>
            <div className="px-4 md:px-10 py-8 border-b border-slate-200 dark:border-[#282d39]">
                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                    API Keys
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                    Manage API keys for integrating with external systems.
                </p>
            </div>

            <div className="px-4 md:px-10 py-6 flex flex-col gap-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                            <KeyIcon className="h-5 w-5 text-primary" />
                            Your API Keys
                        </h3>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                            <Plus className="h-4 w-4" />
                            Create Key
                        </button>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-[#282d39] overflow-hidden divide-y divide-slate-200 dark:divide-[#282d39]">
                        {apiKeys.map((apiKey, index) => (
                            <div key={index} className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">{apiKey.name}</p>
                                    <p className="text-sm text-slate-500 font-mono truncate">{apiKey.key}</p>
                                    <p className="text-xs text-slate-400 mt-1">Created: {apiKey.created}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}

function SettingsToggle({
    title,
    description,
    defaultChecked = false,
}: {
    title: string
    description: string
    defaultChecked?: boolean
}) {
    return (
        <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#232b3e] transition-colors">
            <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white font-medium">{title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
            </label>
        </div>
    )
}

function SaveButtons() {
    return (
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-[#282d39]">
            <button className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-lg shadow-primary/30 transition-all active:scale-95">
                Save Changes
            </button>
        </div>
    )
}
