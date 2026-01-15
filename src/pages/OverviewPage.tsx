import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { incidentsApi } from '../api'
import type { Incident } from '../types/api'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    Timer,
    ArrowRight,
    Activity,
    Zap,
    Shield,
    Droplets,
    Flame,
    ExternalLink,
    Loader2,
} from 'lucide-react'

const typeIcons: Record<string, { iconBg: string }> = {
    'Flash Flood': { iconBg: 'bg-blue-500' },
    'Flood': { iconBg: 'bg-blue-500' },
    'Fire': { iconBg: 'bg-orange-500' },
    'Market Fire': { iconBg: 'bg-orange-500' },
    'Medical Emergency': { iconBg: 'bg-emerald-500' },
    'Road Blockage': { iconBg: 'bg-yellow-500' },
}

const severityClasses: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffMins < 60) return `${diffMins} min ago`
    const hours = Math.floor(diffMins / 60)
    return `${hours}h ${diffMins % 60}m ago`
}

interface StatItem {
    label: string
    value: string
    change: string
    trend: 'up' | 'down'
    icon: typeof AlertTriangle
    iconBg: string
    iconColor: string
}

export function OverviewPage() {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const { user } = useAuth()
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await incidentsApi.getAll({ limit: 100 })
                setIncidents(response.data || [])
                setLastUpdated(new Date())
            } catch (err) {
                console.error('Failed to fetch incidents:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED')
    const resolvedToday = incidents.filter(i => {
        if (i.status !== 'RESOLVED') return false
        const resolved = new Date(i.updatedAt)
        const today = new Date()
        return resolved.toDateString() === today.toDateString()
    })

    const stats: StatItem[] = [
        {
            label: 'Active Incidents',
            value: String(activeIncidents.length),
            change: '+' + activeIncidents.filter(i => i.status === 'PENDING').length,
            trend: 'up',
            icon: AlertTriangle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
        },
        {
            label: 'Responding',
            value: String(incidents.filter(i => i.status === 'RESPONDING').length),
            change: '+0',
            trend: 'up',
            icon: Users,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            label: 'Resolved Today',
            value: String(resolvedToday.length),
            change: '+' + resolvedToday.length,
            trend: 'up',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
        },
        {
            label: 'Pending Triage',
            value: String(incidents.filter(i => i.status === 'PENDING').length),
            change: '',
            trend: 'down',
            icon: Timer,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
        },
    ]

    const recentIncidents = incidents
        .filter(i => i.status !== 'RESOLVED')
        .slice(0, 3)
        .map(inc => ({
            id: inc.id,
            type: inc.type,
            icon: inc.type.includes('Flood') ? Droplets : inc.type.includes('Fire') ? Flame : AlertTriangle,
            iconBg: typeIcons[inc.type]?.iconBg || 'bg-slate-500',
            location: inc.location?.address || 'Unknown location',
            time: formatTimeAgo(inc.createdAt),
            severity: inc.severity,
            severityClass: severityClasses[inc.severity] || severityClasses.MEDIUM,
        }))

    const mapIncidents = incidents
        .filter(i => i.location?.latitude && i.location?.longitude)
        .map(inc => ({
            coords: [inc.location.latitude, inc.location.longitude] as [number, number],
            severity: inc.severity.toLowerCase(),
            type: inc.type,
            id: inc.id,
        }))

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return { fill: '#ef4444', stroke: '#dc2626' }
            case 'high': return { fill: '#f97316', stroke: '#ea580c' }
            case 'medium': return { fill: '#eab308', stroke: '#ca8a04' }
            default: return { fill: '#64748b', stroke: '#475569' }
        }
    }

    const userName = user?.firstName || 'User'
    const minutesAgo = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-slate-500 dark:text-gray-400">Loading dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's happening across your regions today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    Last updated: {minutesAgo < 1 ? 'just now' : `${minutesAgo} min ago`}
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 lg:p-2.5 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.iconColor}`} />
                            </div>
                            {stat.change && (
                                <span
                                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        }`}
                                >
                                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {stat.value}
                        </p>
                        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] overflow-hidden shadow-sm">
                    <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <MapPin className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Geospatial Insights</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {mapIncidents.length} incidents with location data
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/map-view')}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-600"
                        >
                            Full Map
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="h-[300px] lg:h-[350px] relative">
                        <MapContainer
                            center={[6.5244, 3.3792]}
                            zoom={10}
                            className="w-full h-full !z-0"
                            zoomControl={false}
                            scrollWheelZoom={false}
                            dragging={false}
                            style={{ background: theme === 'dark' ? '#1a1a2e' : '#e2e8f0' }}
                        >
                            <TileLayer
                                key={theme}
                                attribution='&copy; OpenStreetMap'
                                url={tileUrl}
                            />
                            {mapIncidents.map((incident) => {
                                const colors = getSeverityColor(incident.severity)
                                return (
                                    <CircleMarker
                                        key={incident.id}
                                        center={incident.coords}
                                        radius={12}
                                        pathOptions={{
                                            fillColor: colors.fill,
                                            fillOpacity: 0.6,
                                            color: colors.stroke,
                                            weight: 2,
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <strong>{incident.type}</strong>
                                                <br />
                                                ID: {incident.id.slice(-6)}
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            })}
                        </MapContainer>
                        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-4 text-xs border border-slate-200 dark:border-slate-700 z-[500]">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Critical</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium</span>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] overflow-hidden shadow-sm flex flex-col">
                    <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Activity Feed</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Latest updates</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {incidents.slice(0, 4).map((inc, i) => (
                            <div key={inc.id} className="flex gap-3">
                                <div className="relative">
                                    <div className="size-2 rounded-full bg-primary mt-2" />
                                    {i < 3 && (
                                        <div className="absolute top-4 left-[3px] w-px h-full bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Incident #{inc.id.slice(-6)} - {inc.type} ({inc.status})
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        {formatTimeAgo(inc.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {incidents.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] overflow-hidden shadow-sm">
                    <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Zap className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Recent Incidents</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Requiring attention</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/incidents')}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-600"
                        >
                            View all
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentIncidents.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active incidents</div>
                        ) : (
                            recentIncidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    onClick={() => navigate('/incidents')}
                                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center gap-4"
                                >
                                    <div className={`p-2 rounded-xl ${incident.iconBg} text-white shrink-0`}>
                                        <incident.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{incident.type}</span>
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${incident.severityClass}`}>
                                                {incident.severity}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1 truncate">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                {incident.location}
                                            </span>
                                            <span className="flex items-center gap-1 shrink-0">
                                                <Clock className="h-3 w-3" />
                                                {incident.time}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] p-4 lg:p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <MapPin className="h-5 w-5 text-purple-500" />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">By Severity</h2>
                        </div>
                        <div className="space-y-3">
                            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                                const count = incidents.filter(i => i.severity === sev).length
                                const maxCount = incidents.length || 1
                                return (
                                    <div key={sev}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{sev}</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${sev === 'CRITICAL' ? 'bg-red-500' :
                                                    sev === 'HIGH' ? 'bg-orange-500' :
                                                        sev === 'MEDIUM' ? 'bg-yellow-500' : 'bg-slate-400'
                                                    }`}
                                                style={{ width: `${(count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary to-blue-600 p-4 lg:p-5 shadow-sm text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="h-5 w-5" />
                                <h2 className="font-bold text-sm">System Status</h2>
                            </div>
                            <p className="text-xs text-white/70 mb-4">All systems operational</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                    <p className="text-lg font-bold">{incidents.length}</p>
                                    <p className="text-[10px] text-white/70">Total</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                    <p className="text-lg font-bold">{activeIncidents.length}</p>
                                    <p className="text-[10px] text-white/70">Active</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                    <p className="text-lg font-bold">{resolvedToday.length}</p>
                                    <p className="text-[10px] text-white/70">Resolved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
