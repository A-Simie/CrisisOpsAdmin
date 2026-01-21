import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    AlertTriangle,
    Backpack,
    Map,
    User,
    Users,
    Building2,
    Bell,
    Search,
    LogOut,
    HeartPulse,
    Menu,
    Landmark,
    X,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole, UserRoleType } from '../types/api'

interface DashboardLayoutProps {
    children: ReactNode
    onLogout: () => void
    currentPage: string
    onNavigate: (page: string) => void
}

interface NavItem {
    icon: typeof LayoutDashboard
    label: string
    path: string
    minRole?: UserRoleType
}

const getNavItems = (userRole: UserRoleType): NavItem[] => {
    const allItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '' },
        { icon: AlertTriangle, label: 'Incidents', path: 'incidents' },
        { icon: Backpack, label: 'Hazard Packs', path: 'hazard-packs' },
        { icon: Map, label: 'Map View', path: 'map-view' },
        { icon: Users, label: 'Users', path: 'users', minRole: 'ORG_ADMIN' },
        { icon: Building2, label: 'Organizations', path: 'organizations', minRole: 'GOV_ADMIN' },
        { icon: Landmark, label: 'Govt. Officials', path: 'gov-admins', minRole: 'SUPER_ADMIN' },
    ]

    return allItems.filter(item =>
        !item.minRole || hasMinimumRole(userRole, item.minRole)
    )
}

const pageTitles: Record<string, string> = {
    '': 'Overview',
    'dashboard': 'Overview',
    'incidents': 'Incidents',
    'hazard-packs': 'Hazard Packs',
    'map-view': 'Map View',
    'users': 'Users',
    'organizations': 'Organizations',
    'profile': 'Profile',
    'profile/edit': 'Edit Profile',
}

export function DashboardLayout({ children, onLogout, currentPage, onNavigate }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()

    const navItems = getNavItems(user?.role || 'CITIZEN')

    const handleNavigate = (path: string) => {
        onNavigate(path)
        setSidebarOpen(false)
    }

    const handleLogout = () => {
        onLogout()
        navigate('/login')
    }

    const isActive = (path: string) => {
        if (path === '' && (currentPage === '' || currentPage === 'dashboard')) return true
        return currentPage === path
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex ${sidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden lg:flex'}`}>
                <div className="flex h-full flex-col justify-between p-4">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 px-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                    CrisisOps
                                </h1>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-left w-full ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary dark:bg-primary dark:text-white'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'fill-current' : ''}`} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => handleNavigate('profile')}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-left w-full ${currentPage === 'profile'
                                ? 'bg-primary/10 text-primary dark:bg-primary dark:text-white'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <User className="h-5 w-5" />
                            <span className="text-sm font-medium">Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-left w-full"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex flex-1 flex-col min-w-0">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 -ml-2"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                            {pageTitles[currentPage] || 'Overview'}
                        </h2>
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4">
                        <div className="hidden max-w-md flex-1 lg:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    className="h-10 w-full rounded-lg border-none bg-slate-100 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                                    placeholder="Search incidents, locations..."
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3">
                            <ThemeToggle />
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                <Bell className="h-5 w-5" />
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111318]" />
                            </button>
                            <button
                                onClick={() => handleNavigate('profile')}
                                className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                            >
                                {user?.profilePicture ? (
                                    <img
                                        alt={user.firstName}
                                        className="h-full w-full object-cover"
                                        src={user.profilePicture}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary text-white font-medium">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 min-h-0 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    )
}
