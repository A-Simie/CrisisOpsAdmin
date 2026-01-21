import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
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
    ExternalLink,
    Loader2,
} from 'lucide-react'

const typeIcons: Record<string, { iconBg: string }> = {
    'FLOOD': { iconBg: 'bg-blue-500' },
    'FIRE': { iconBg: 'bg-orange-500' },
    'EPIDEMIC': { iconBg: 'bg-emerald-500' },
    'INFRASTRUCTURE': { iconBg: 'bg-yellow-500' },
    'EARTHQUAKE': { iconBg: 'bg-red-600' },
    'STORM': { iconBg: 'bg-cyan-500' },
    'SECURITY': { iconBg: 'bg-indigo-500' },
    'ACCIDENT': { iconBg: 'bg-rose-500' },
    'LANDSLIDE': { iconBg: 'bg-amber-600' },
    'DROUGHT': { iconBg: 'bg-orange-400' },
    'OTHER': { iconBg: 'bg-slate-500' },
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
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const hours = Math.floor(diffMins / 60)
    if (hours < 24) return `${hours}h ${diffMins % 60}m ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
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
    const [allIncidents, setAllIncidents] = useState<Incident[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await incidentsApi.getAll()
                setAllIncidents(response.data || [])
                setLastUpdated(new Date())
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const activeIncidents = allIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'FALSE_ALARM')
    const respondingIncidents = allIncidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'DISPATCHED')
    const resolvedToday = allIncidents.filter(i => {
        if (i.status !== 'RESOLVED') return false
        const resolved = new Date(i.updatedAt)
        const today = new Date()
        return resolved.getDate() === today.getDate() &&
            resolved.getMonth() === today.getMonth() &&
            resolved.getFullYear() === today.getFullYear()
    })
    const pendingTriage = allIncidents.filter(i => i.status === 'REPORTED')

    const displayStats: StatItem[] = [
        {
            label: 'Active Incidents',
            value: String(activeIncidents.length),
            change: `+${pendingTriage.length}`,
            trend: 'up',
            icon: AlertTriangle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
        },
        {
            label: 'Responding',
            value: String(respondingIncidents.length),
            change: `+${respondingIncidents.length}`,
            trend: 'up',
            icon: Users,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            label: 'Resolved Today',
            value: String(resolvedToday.length),
            change: `+${resolvedToday.length}`,
            trend: 'up',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
        },
        {
            label: 'Pending Triage',
            value: String(pendingTriage.length),
            change: '',
            trend: 'down',
            icon: Timer,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
        },
    ]

    const recentIncidents = allIncidents.slice(0, 5)
    const recentIncidentsForDisplay = recentIncidents.map(inc => ({
        id: inc.id,
        type: inc.hazardType,
        location: inc.location?.address || inc.location?.city || 'Unknown Location',
        time: formatTimeAgo(inc.createdAt),
        severity: inc.severity,
        severityClass: severityClasses[inc.severity] || severityClasses.MEDIUM,
        iconBg: typeIcons[inc.hazardType]?.iconBg || 'bg-gray-500',
    }))

    const mapIncidents = allIncidents
        .filter(i => i.location?.latitude && i.location?.longitude)
        .map(inc => ({
            coords: [inc.location.latitude, inc.location.longitude] as [number, number],
            severity: inc.severity,
            type: inc.hazardType,
            id: inc.id,
            location: inc.location?.address || inc.location?.city || 'Unknown location',
        }))

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    const createMarkerIcon = (hazardType: string, severity: string) => {
        const severityColors: Record<string, string> = {
            'CRITICAL': 'bg-red-500',
            'HIGH': 'bg-orange-500',
            'MEDIUM': 'bg-yellow-500',
            'LOW': 'bg-slate-400',
        }
        const iconBg = severityColors[severity] || 'bg-slate-500'

        // SVG icons for each hazard type
        const hazardIcons: Record<string, string> = {
            'FLOOD': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
            'FIRE': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
            'EARTHQUAKE': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
            'STORM': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5"/></svg>`,
            'LANDSLIDE': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/></svg>`,
            'DROUGHT': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
            'EPIDEMIC': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
            'INFRASTRUCTURE': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
            'SECURITY': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
            'ACCIDENT': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-4h9l4 4h3v6h-2"/><path d="M10 9V5"/><path d="M14 9V5"/></svg>`,
            'OTHER': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        }
        const iconSvg = hazardIcons[hazardType] || hazardIcons['OTHER']

        return L.divIcon({
            html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${iconBg} text-white shadow-lg">
                     ${iconSvg}
                   </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        })
    }

    const severityBreakdown = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => ({
        name: sev,
        count: allIncidents.filter(i => i.severity === sev).length,
    }))

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
                {displayStats.map((stat) => (
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
                        {mapIncidents.length > 0 ? (
                            <MapContainer
                                center={mapIncidents[0]?.coords || [6.5244, 3.3792]}
                                zoom={11}
                                className="w-full h-full !z-0"
                                zoomControl={false}
                                scrollWheelZoom={false}
                                dragging={false}
                                style={{ background: theme === 'dark' ? '#1a1a2e' : '#e2e8f0' }}
                            >
                                <TileLayer
                                    key={theme}
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url={tileUrl}
                                />
                                {mapIncidents.map((incident, idx) => (
                                    <Marker
                                        key={`${incident.coords[0]}-${incident.coords[1]}-${idx}`}
                                        position={incident.coords}
                                        icon={createMarkerIcon(incident.type, incident.severity)}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <strong>{incident.type}</strong>
                                                <br />
                                                ID: {incident.id.slice(-6)}
                                                <br />
                                                {incident.location}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                No incidents with location data to display.
                            </div>
                        )}
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
                        {recentIncidents.slice(0, 4).map((inc, i) => (
                            <div key={inc.id} className="flex gap-3">
                                <div className="relative">
                                    <div className="size-2 rounded-full bg-primary mt-2" />
                                    {i < 3 && (
                                        <div className="absolute top-4 left-[3px] w-px h-full bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Incident #{inc.id.slice(-6)} - {inc.hazardType} ({inc.status})
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        {formatTimeAgo(inc.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentIncidents.length === 0 && (
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
                        {recentIncidentsForDisplay.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active incidents</div>
                        ) : (
                            recentIncidentsForDisplay.map((incident) => (
                                <div
                                    key={incident.id}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1b1f27] transition-colors cursor-pointer group"
                                    onClick={() => navigate('/incidents')}
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${incident.iconBg} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {incident.type}
                                            </h4>
                                            <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-[#1b1f27] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#282d39]">
                                                {incident.time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{incident.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${incident.severityClass}`}>
                                            {incident.severity}
                                        </span>
                                    </div>
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
                            {severityBreakdown.map((sev) => {
                                const maxCount = allIncidents.length || 1
                                return (
                                    <div key={sev.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{sev.name}</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{sev.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${sev.name === 'CRITICAL' ? 'bg-red-500' :
                                                    sev.name === 'HIGH' ? 'bg-orange-500' :
                                                        sev.name === 'MEDIUM' ? 'bg-yellow-500' : 'bg-slate-400'
                                                    }`}
                                                style={{ width: `${(sev.count / maxCount) * 100}%` }}
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
                                    <p className="text-lg font-bold">{allIncidents.length}</p>
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
