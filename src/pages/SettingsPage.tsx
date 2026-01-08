import { useState } from 'react'
import {
    Building2,
    Bell,
    Shield,
    Palette,
    Key,
    Volume2,
    Mail,
    Phone,
    Lock,
    Smartphone,
    Globe,
    Moon,
    Sun,
    Monitor,
    Copy,
    Plus,
    Trash2,
    Eye,
    X,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

type SettingsTab = 'organization' | 'notifications' | 'security' | 'display' | 'api-keys'

const navItems: { icon: typeof Bell; label: string; tab: SettingsTab }[] = [
    { icon: Building2, label: 'Organization', tab: 'organization' },
    { icon: Bell, label: 'Notifications', tab: 'notifications' },
    { icon: Shield, label: 'Security', tab: 'security' },
    { icon: Palette, label: 'Display', tab: 'display' },
    { icon: Key, label: 'API Keys', tab: 'api-keys' },
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
                            <X className="h-5 w-5" />
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
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
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
                <section>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Password
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-[#282d39] p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3"
                                />
                            </div>
                        </div>
                    </div>
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

                <SaveButtons />
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
                            <Key className="h-5 w-5 text-primary" />
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
