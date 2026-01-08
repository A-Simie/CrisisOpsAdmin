import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Bell,
    Key,
    LogOut,
} from 'lucide-react'

export function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0">
                    <div
                        className="size-32 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center ring-4 ring-white dark:ring-[#1e293b] shadow-xl"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face')",
                        }}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alex Morgan</h1>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
                            Active
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Response Lead • Lagos Operations Center</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            alex.morgan@reliefops.org
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            +234 801 234 5678
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            Lagos, Nigeria
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            Joined Jan 2023
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-card-dark">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Incidents Handled</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">847</p>
                    <p className="text-xs text-emerald-500 mt-1">+23 this week</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-card-dark">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Response Time</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">12m</p>
                    <p className="text-xs text-slate-400 mt-1">Below team average</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-card-dark">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Resolution Rate</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">94%</p>
                    <p className="text-xs text-emerald-500 mt-1">Excellent</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card-dark overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Settings</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <SettingsRow
                        icon={User}
                        label="Edit Profile"
                        description="Update your personal information"
                    />
                    <SettingsRow
                        icon={Shield}
                        label="Security"
                        description="Manage password and 2FA"
                    />
                    <SettingsRow
                        icon={Bell}
                        label="Notifications"
                        description="Configure alert preferences"
                    />
                    <SettingsRow
                        icon={Key}
                        label="API Access"
                        description="View and manage API keys"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 dark:text-red-300">Sign Out</h3>
                            <p className="text-sm text-red-700 dark:text-red-400">End your current session</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

function SettingsRow({
    icon: Icon,
    label,
    description,
}: {
    icon: typeof User
    label: string
    description: string
}) {
    return (
        <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
            </div>
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    )
}
