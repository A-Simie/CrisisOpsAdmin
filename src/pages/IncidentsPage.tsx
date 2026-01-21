import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'
import {
    Search,
    RefreshCw,
    ChevronDown,
    Check,
    Droplets,
    Flame,
    Stethoscope,
    Wrench,
    AlertTriangle,
    Camera,
    Video,
    ShieldCheck,
    UserPlus,
    MapPin,
    X,
    Send,
    CheckCircle,
    Loader2,
    Building2,
    ExternalLink,
    Play,
    ChevronLeft,
    ChevronRight,
    XCircle,
    Clock,
    Truck,
    type LucideIcon,
} from 'lucide-react'
import { incidentsApi, organizationsApi } from '../api'
import type { Incident, IncidentStatusType, Organization } from '../types/api'


const hazardTypeIcons: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
    FLOOD: { icon: Droplets, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    FIRE: { icon: Flame, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    EARTHQUAKE: { icon: AlertTriangle, iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' },
    STORM: { icon: AlertTriangle, iconBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    LANDSLIDE: { icon: AlertTriangle, iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
    DROUGHT: { icon: AlertTriangle, iconBg: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' },
    EPIDEMIC: { icon: Stethoscope, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    INFRASTRUCTURE: { icon: Wrench, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    SECURITY: { icon: ShieldCheck, iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    ACCIDENT: { icon: AlertTriangle, iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400' },
    OTHER: { icon: AlertTriangle, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400' },
}

const defaultIcon = { icon: AlertTriangle, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400' }

const severityClasses: Record<Incident['severity'], string> = {
    CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
    HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

const statusStyles: Record<string, { dot: string; label: string }> = {
    REPORTED: { dot: 'bg-orange-500 animate-pulse', label: 'Reported' },
    VERIFIED: { dot: 'bg-blue-500', label: 'Verified' },
    ASSIGNED: { dot: 'bg-indigo-500', label: 'Assigned' },
    DISPATCHED: { dot: 'bg-cyan-500', label: 'Dispatched' },
    IN_PROGRESS: { dot: 'bg-purple-500', label: 'In Progress' },
    RESOLVED: { dot: 'bg-green-500', label: 'Resolved' },
    CLOSED: { dot: 'bg-slate-500', label: 'Closed' },
    FALSE_ALARM: { dot: 'bg-yellow-500', label: 'False Alarm' },
}

function formatTimeAgo(dateString: string): { time: string; ago: string; agoClass: string } {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (diffMins < 30) {
        return { time, ago: `-${diffMins}m ago`, agoClass: 'text-red-500' }
    } else if (diffMins < 60) {
        return { time, ago: `-${diffMins}m ago`, agoClass: 'text-orange-500' }
    } else {
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        return { time, ago: `-${hours}h ${mins}m`, agoClass: 'text-slate-500' }
    }
}

const createMarkerIcon = (hazardType: string) => {
    // Simple color mapping without external config
    const colors: Record<string, string> = {
        FLOOD: '#3b82f6', FIRE: '#f97316', EARTHQUAKE: '#dc2626', STORM: '#06b6d4',
        LANDSLIDE: '#d97706', DROUGHT: '#eab308', EPIDEMIC: '#10b981',
        INFRASTRUCTURE: '#8b5cf6', SECURITY: '#6366f1', ACCIDENT: '#f43f5e',
        OTHER: '#64748b'
    };
    const color = colors[hazardType] || colors.OTHER;

    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="width: 36px; height: 36px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
    })
}

function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, 14)
    }, [center, map])
    return null
}

function MediaGallery({ media }: { media: Incident['media'] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    if (!media || media.length === 0) {
        return (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] bg-slate-100 dark:bg-[#1a1d26] h-48 flex items-center justify-center">
                <div className="text-center text-slate-400 dark:text-slate-500">
                    <Camera className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No media attached</p>
                </div>
            </div>
        )
    }

    const currentMedia = media[currentIndex]
    const isVideo = currentMedia.type === 'VIDEO'

    return (
        <>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] bg-slate-900 h-48">
                {isVideo ? (
                    <video
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        controls
                        poster={currentMedia.url + '?frame=1'}
                    />
                ) : (
                    <img
                        src={currentMedia.url}
                        alt={currentMedia.caption || 'Incident media'}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxOpen(true)}
                    />
                )}

                {media.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((i) => (i - 1 + media.length) % media.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentIndex((i) => (i + 1) % media.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {media.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`size-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {isVideo && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Video
                    </div>
                )}

                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                    {currentIndex + 1} / {media.length}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && !isVideo && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={currentMedia.url}
                        alt={currentMedia.caption || 'Incident media'}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Thumbnails */}
            {media.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {media.map((m, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentIndex
                                ? 'border-primary'
                                : 'border-transparent hover:border-slate-400'
                                }`}
                        >
                            <img
                                src={m.url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            {m.type === 'VIDEO' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play className="h-4 w-4 text-white" fill="white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </>
    )
}

function OrganizationAssignment({
    incident,
    onAssign,
}: {
    incident: Incident
    onAssign: (orgId: string) => Promise<void>
}) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)

    useEffect(() => {
        async function fetchOrgs() {
            setIsLoading(true)
            try {
                const orgs = await organizationsApi.getAll()
                setOrganizations(Array.isArray(orgs) ? orgs : [])
            } catch (err) {
                console.error('Failed to fetch organizations:', err)
            } finally {
                setIsLoading(false)
            }
        }
        if (isOpen && organizations.length === 0) {
            fetchOrgs()
        }
    }, [isOpen, organizations.length])

    const handleAssign = async (orgId: string) => {
        setIsAssigning(true)
        try {
            await onAssign(orgId)
            setIsOpen(false)
        } catch (err) {
            console.error('Failed to assign:', err)
        } finally {
            setIsAssigning(false)
        }
    }

    const assignedOrg = organizations.find((o) => o.id === incident.primaryOrgId)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#282d39] bg-white dark:bg-[#1a1d26] hover:bg-slate-50 dark:hover:bg-[#282d39] transition-colors flex items-center justify-between gap-2"
            >
                <div className="flex items-center gap-2 text-sm min-w-0">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    {incident.primaryOrgId ? (
                        <span className="text-slate-900 dark:text-white truncate">
                            {assignedOrg?.name || 'Assigned Organization'}
                        </span>
                    ) : (
                        <span className="text-slate-500 dark:text-slate-400">Assign to organization...</span>
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39] rounded-lg shadow-xl z-[70] max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        ) : organizations.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No organizations found
                            </div>
                        ) : (
                            organizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => handleAssign(org.id)}
                                    disabled={isAssigning || org.id === incident.primaryOrgId}
                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-[#282d39] transition-colors text-left disabled:opacity-50 ${org.id === incident.primaryOrgId ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                        {org.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {org.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{org.type}</p>
                                    </div>
                                    {org.id === incident.primaryOrgId && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export function IncidentsPage() {
    const { theme } = useTheme()
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchIncidents = useCallback(async (showRefreshState = false) => {
        if (showRefreshState) setIsRefreshing(true)
        else setIsLoading(true)
        setError(null)

        try {
            const response = await incidentsApi.getAll()
            setIncidents(response.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load incidents')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchIncidents()
    }, [fetchIncidents])

    const handleRefresh = () => {
        fetchIncidents(true)
    }

    const handleUpdateStatus = async (incidentId: string, status: IncidentStatusType) => {
        try {
            await incidentsApi.updateStatus(incidentId, status)
            setIncidents(prev => prev.map(inc =>
                inc.id === incidentId ? { ...inc, status } : inc
            ))
            if (selectedIncident?.id === incidentId) {
                setSelectedIncident(prev => prev ? { ...prev, status } : null)
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }



    const handleConfirmIncident = async (incidentId: string) => {
        try {
            const updated = await incidentsApi.confirm(incidentId)
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updated : inc))
            if (selectedIncident?.id === incidentId) setSelectedIncident(updated)
        } catch (err) {
            console.error('Failed to confirm incident:', err)
        }
    }

    const handleAssignOrganization = async (incidentId: string, orgId: string) => {
        try {
            const updated = await incidentsApi.assign(incidentId, orgId, true)
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updated : inc))
            if (selectedIncident?.id === incidentId) setSelectedIncident(updated)
        } catch (err) {
            console.error('Failed to assign organization:', err)
            throw err
        }
    }

    const filteredIncidents = incidents.filter(inc =>
        inc.hazardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.id.includes(searchQuery)
    )


    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-slate-500 dark:text-gray-400">Loading incidents...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 text-center px-4">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => fetchIncidents()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative -m-4 lg:-m-8">
            <div className="flex flex-col gap-4 p-4 lg:p-6 pb-2 shrink-0 bg-white dark:bg-[#111318]">
                <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                            Incidents Triage Queue
                        </h1>
                        <p className="text-slate-500 dark:text-[#9ca4ba] text-sm font-normal leading-normal">
                            Real-time feed. <span className="text-primary font-bold">{filteredIncidents.filter(i => i.status === 'REPORTED').length} Pending</span> items require attention.
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex h-9 items-center justify-center gap-x-2 rounded-lg bg-primary hover:bg-blue-600 text-white px-4 transition-colors shrink-0 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Refresh Feed</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-3 items-center w-full">
                    <div className="relative flex-1 min-w-[150px] max-w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-[#9ca4ba]" />
                        <input
                            className="w-full bg-slate-100 dark:bg-[#282d39] text-slate-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none border-none placeholder:text-slate-400 dark:placeholder:text-[#9ca4ba]"
                            placeholder="Search by type, location, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <FilterButton label="Hazard Type" />
                        <FilterButton label="Severity" />
                        <FilterButton label="Status" />
                        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-[#282d39] mx-1" />
                        <button className="flex h-9 shrink-0 items-center gap-x-2 rounded-lg bg-primary/10 border border-primary/20 px-3">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-primary text-sm font-medium">Has Media</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-[#111318]">
                {filteredIncidents.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-slate-500 dark:text-gray-400">
                        {searchQuery ? 'No incidents match your search' : 'No incidents found'}
                    </div>
                ) : (
                    <div className="min-w-[900px]">
                        <div className="px-6 py-2 grid grid-cols-[100px_180px_90px_180px_140px_80px_60px] gap-4 border-b border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#1a1d26] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ca4ba] sticky top-0 z-10">
                            <div>Time</div>
                            <div>Hazard</div>
                            <div>Severity</div>
                            <div>Location</div>
                            <div>Status</div>
                            <div className="text-center">Badges</div>
                            <div className="text-right">Assign</div>
                        </div>

                        {filteredIncidents.map((incident) => {
                            const { time, ago, agoClass } = formatTimeAgo(incident.createdAt)
                            const typeIcon = hazardTypeIcons[incident.hazardType] || defaultIcon
                            const IconComponent = typeIcon.icon
                            const status = statusStyles[incident.status]

                            return (
                                <div
                                    key={incident.id}
                                    onClick={() => setSelectedIncident(incident)}
                                    className={`grid grid-cols-[100px_180px_90px_180px_140px_80px_60px] gap-4 px-6 py-4 border-b border-slate-100 dark:border-[#282d39] hover:bg-slate-50 dark:hover:bg-[#1a1d26] cursor-pointer transition-colors items-center ${selectedIncident?.id === incident.id
                                        ? 'bg-primary/5 dark:bg-primary/10 border-l-[3px] border-l-primary'
                                        : ''
                                        }`}
                                >
                                    <div className="flex flex-col justify-center">
                                        <span className="text-slate-900 dark:text-white font-medium tabular-nums text-sm">
                                            {time}
                                        </span>
                                        <span className={`text-xs font-medium ${agoClass}`}>{ago}</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`size-8 shrink-0 rounded-full ${typeIcon.iconBg} flex items-center justify-center ${typeIcon.iconColor}`}>
                                            <IconComponent className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-slate-900 dark:text-white font-medium text-sm truncate">{incident.title || incident.hazardType}</span>
                                            <span className="text-xs text-slate-500">ID: #{incident.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${severityClasses[incident.severity]}`}>
                                            {incident.severity}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm min-w-0">
                                        <span className="truncate">{incident.location?.address || 'Unknown location'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`size-2 shrink-0 rounded-full ${status.dot}`} />
                                            <span className="text-slate-700 dark:text-white text-sm truncate">{status.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        {incident.media && incident.media.length > 0 && <Camera className="h-4 w-4 text-slate-400" />}
                                        {incident.media?.some(m => m.type === 'VIDEO') && <Video className="h-4 w-4 text-slate-400" />}
                                        {incident.communityConfirmations > 0 && <ShieldCheck className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <div className="flex items-center justify-end">
                                        {incident.primaryOrgId ? (
                                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                {incident.primaryOrgId.slice(0, 2).toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="size-8 rounded-full bg-slate-200 dark:bg-[#282d39] border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                                <UserPlus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedIncident && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSelectedIncident(null)}
                    />
                    <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-[#161a23] border-l border-slate-200 dark:border-[#282d39] flex flex-col shadow-2xl z-50">
                        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Incident #{selectedIncident.id.slice(-6)}
                                    </h2>
                                    {selectedIncident.status === 'REPORTED' && (
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded font-medium">
                                            NEW
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Reported {formatTimeAgo(selectedIncident.createdAt).ago.replace('-', '')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                            {/* Media Gallery */}
                            <MediaGallery media={selectedIncident.media} />

                            {/* Mini Map */}
                            {selectedIncident.location?.latitude && selectedIncident.location?.longitude && (
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] h-40 relative">
                                    <MapContainer
                                        center={[selectedIncident.location.latitude, selectedIncident.location.longitude]}
                                        zoom={14}
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
                                        <MapController center={[selectedIncident.location.latitude, selectedIncident.location.longitude]} />
                                        <Marker
                                            position={[selectedIncident.location.latitude, selectedIncident.location.longitude]}
                                            icon={createMarkerIcon(selectedIncident.hazardType)}
                                        />
                                    </MapContainer>
                                    <a
                                        href={`/map-view?incident=${selectedIncident.id}`}
                                        className="absolute top-2 right-2 px-2 py-1 bg-white dark:bg-[#111318] rounded-lg shadow text-xs font-medium text-primary flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-[#1a1d26] transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Full Map
                                    </a>
                                    <div className="absolute bottom-2 left-2 bg-white dark:bg-[#111318] px-2 py-1 rounded-lg shadow-sm text-xs font-medium flex items-center gap-1.5 text-slate-900 dark:text-white">
                                        <MapPin className="h-3 w-3 text-red-500" />
                                        {selectedIncident.location?.address || `${selectedIncident.location.latitude.toFixed(4)}, ${selectedIncident.location.longitude.toFixed(4)}`}
                                    </div>
                                </div>
                            )}

                            {/* Organization Assignment */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Assign Organization</h3>
                                <OrganizationAssignment
                                    incident={selectedIncident}
                                    onAssign={(orgId) => handleAssignOrganization(selectedIncident.id, orgId)}
                                />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-xs text-slate-500 mb-1">Hazard Type</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                        {(() => {
                                            const { icon: Icon, iconColor } = hazardTypeIcons[selectedIncident.hazardType] || defaultIcon
                                            return <Icon className={`h-4 w-4 ${iconColor}`} />
                                        })()}
                                        {selectedIncident.hazardType}
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-xs text-slate-500 mb-1">Severity</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${severityClasses[selectedIncident.severity]}`}>
                                            {selectedIncident.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {selectedIncident.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 border-t border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] flex flex-col gap-3">
                            {/* Status-aware action buttons */}
                            {selectedIncident.status === 'REPORTED' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedIncident.id, 'VERIFIED')}
                                        className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Verify Incident
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'FALSE_ALARM')}
                                            className="w-full h-9 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Mark as False Alarm
                                        </button>
                                        <button
                                            onClick={() => handleConfirmIncident(selectedIncident.id)}
                                            className="w-full h-9 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {selectedIncident.communityConfirmations > 0 ? 'Confirmed' : 'Confirm'}
                                        </button>
                                    </div>
                                    <button className="w-full h-10 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Share
                                    </button>
                                </>
                            )}

                            {selectedIncident.status === 'VERIFIED' && (
                                <button
                                    onClick={() => {
                                        if (selectedIncident.primaryOrgId) {
                                            handleUpdateStatus(selectedIncident.id, 'ASSIGNED')
                                        }
                                    }}
                                    disabled={!selectedIncident.primaryOrgId}
                                    className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Building2 className="h-4 w-4" />
                                    {selectedIncident.primaryOrgId ? 'Assign to Organization' : 'Select Org First (above)'}
                                </button>
                            )}

                            {selectedIncident.status === 'ASSIGNED' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedIncident.id, 'DISPATCHED')}
                                    className="w-full h-10 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                                >
                                    <Truck className="h-4 w-4" />
                                    Dispatch Unit
                                </button>
                            )}

                            {selectedIncident.status === 'DISPATCHED' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedIncident.id, 'IN_PROGRESS')}
                                    className="w-full h-10 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                                >
                                    <Clock className="h-4 w-4" />
                                    Mark In Progress
                                </button>
                            )}

                            {selectedIncident.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedIncident.id, 'RESOLVED')}
                                    className="w-full h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Resolve Incident
                                </button>
                            )}

                            {(selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED' || selectedIncident.status === 'FALSE_ALARM') && (
                                <div className="text-center py-2 text-slate-500 dark:text-slate-400 text-sm">
                                    This incident is {statusStyles[selectedIncident.status]?.label || selectedIncident.status}
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}
        </div>
    )
}

function FilterButton({ label }: { label: string }) {
    return (
        <button className="flex h-9 shrink-0 items-center gap-x-2 rounded-lg border border-slate-200 dark:border-[#282d39] bg-transparent hover:bg-slate-50 dark:hover:bg-[#282d39] px-3 transition-colors">
            <span className="text-slate-700 dark:text-white text-sm font-medium">{label}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
    )
}
