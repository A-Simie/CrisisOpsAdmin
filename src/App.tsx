import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { AuthErrorPage } from './pages/AuthErrorPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { OverviewPage } from './pages/OverviewPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { HazardPacksPage } from './pages/HazardPacksPage'
import { MapViewPage } from './pages/MapViewPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { UsersPage } from './pages/UsersPage'
import { OrganizationsPage } from './pages/OrganizationsPage'
import { GovAdminsPage } from './pages/GovAdminsPage'
import { hasMinimumRole, UserRoleType } from './types/api'
import { ReactNode } from 'react'

interface RoleGuardProps {
    children: ReactNode
    minRole: UserRoleType
}

function RoleGuard({ children, minRole }: RoleGuardProps) {
    const { user } = useAuth()
    if (!user || !hasMinimumRole(user.role, minRole)) {
        return <Navigate to="/" replace />
    }
    return <>{children}</>
}

function AuthenticatedApp() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    const currentPage = location.pathname.replace('/', '') || 'dashboard'

    const handleNavigate = (page: string) => {
        navigate(`/${page === 'dashboard' ? '' : page}`)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <DashboardLayout
            onLogout={handleLogout}
            currentPage={currentPage as any}
            onNavigate={handleNavigate}
        >
            <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/hazard-packs" element={<HazardPacksPage />} />
                <Route path="/map-view" element={<MapViewPage />} />
                <Route path="/users" element={
                    <RoleGuard minRole="ORG_ADMIN">
                        <UsersPage />
                    </RoleGuard>
                } />
                <Route path="/organizations" element={
                    <RoleGuard minRole="GOV_ADMIN">
                        <OrganizationsPage />
                    </RoleGuard>
                } />
                <Route path="/gov-admins" element={
                    <RoleGuard minRole="SUPER_ADMIN">
                        <GovAdminsPage />
                    </RoleGuard>
                } />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </DashboardLayout>
    )
}

function AppRoutes() {
    const { isAuthenticated, isInitializing } = useAuth()

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col overflow-hidden">
            {isAuthenticated ? (
                <AuthenticatedApp />
            ) : (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/auth/error" element={<AuthErrorPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            )}
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
