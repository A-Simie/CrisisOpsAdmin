import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { OverviewPage } from './pages/OverviewPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { HazardPacksPage } from './pages/HazardPacksPage'
import { MapViewPage } from './pages/MapViewPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
    const navigate = useNavigate()
    const location = useLocation()

    const currentPage = location.pathname.replace('/', '') || 'dashboard'

    const handleNavigate = (page: string) => {
        navigate(`/${page === 'dashboard' ? '' : page}`)
    }

    return (
        <DashboardLayout
            onLogout={onLogout}
            currentPage={currentPage as any}
            onNavigate={handleNavigate}
        >
            <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/hazard-packs" element={<HazardPacksPage />} />
                <Route path="/map-view" element={<MapViewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </DashboardLayout>
    )
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const handleLogin = () => {
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
    }

    return (
        <ThemeProvider>
            <BrowserRouter>
                <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col overflow-hidden">
                    {isAuthenticated ? (
                        <AuthenticatedApp onLogout={handleLogout} />
                    ) : (
                        <Routes>
                            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    )}
                </div>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
