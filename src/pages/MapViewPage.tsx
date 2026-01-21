import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'
import { incidentsApi, organizationsApi } from '../api'
import type { Incident, Organization, IncidentStatusType } from '../types/api'

import {
    Search,
    Plus,
    Minus,
    Navigation,
    Layers,
    X,
    MapPin,
    Edit,
    CheckCircle,
    ChevronDown,
    Filter,
    Loader2,
    Video,
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    XCircle,
    ShieldCheck,
    Truck,
    Clock,
} from 'lucide-react'

const hazardColors: Record<string, string> = {
    FLOOD: '#3b82f6', // blue-500
    FIRE: '#f97316', // orange-500
    EARTHQUAKE: '#dc2626', // red-600
    STORM: '#06b6d4', // cyan-500
    LANDSLIDE: '#d97706', // amber-600
    DROUGHT: '#eab308', // yellow-500
    EPIDEMIC: '#10b981', // emerald-500
    INFRASTRUCTURE: '#8b5cf6', // violet-500
    SECURITY: '#6366f1', // indigo-500
    ACCIDENT: '#f43f5e', // rose-500
    OTHER: '#64748b', // slate-500
}

const createMarkerIcon = (hazardType: string, severity: string) => {
    const severityColors: Record<string, string> = {
        'CRITICAL': '#ef4444',
        'HIGH': '#f97316',
        'MEDIUM': '#eab308',
        'LOW': '#64748b',
    }
    const color = severityColors[severity] || '#64748b'

    // SVG icons for each hazard type
    const hazardIcons: Record<string, string> = {
        'FLOOD': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
        'FIRE': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
        'EARTHQUAKE': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
        'STORM': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
        'LANDSLIDE': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/></svg>`,
        'DROUGHT': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
        'EPIDEMIC': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
        'INFRASTRUCTURE': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        'SECURITY': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
        'ACCIDENT': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-4h9l4 4h3v6h-2"/><path d="M10 9V5"/><path d="M14 9V5"/></svg>`,
        'OTHER': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    }
    const iconSvg = hazardIcons[hazardType] || hazardIcons['OTHER']

    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${iconSvg}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    })
}

interface MapIncident {
    id: string
    hazardType: string
    severity: Incident['severity']
    status: Incident['status']
    title: string
    location: string
    coords: [number, number]
    description: string
    createdAt: string
    media: Incident['media']
    primaryOrgId: string | null
    communityConfirmations: number
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffMins < 60) return `${diffMins}m ago`
    const hours = Math.floor(diffMins / 60)
    return `${hours}h ${diffMins % 60}m ago`
}

const severityStyles: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: 'bg-red-100 dark:bg-red-400/10', text: 'text-red-700 dark:text-red-400' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-400/10', text: 'text-orange-700 dark:text-orange-400' },
    MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-400/10', text: 'text-yellow-700 dark:text-yellow-400' },
    LOW: { bg: 'bg-slate-100 dark:bg-slate-400/10', text: 'text-slate-600 dark:text-slate-400' },
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    REPORTED: { bg: 'bg-orange-100 dark:bg-orange-400/10', text: 'text-orange-700 dark:text-orange-400', label: 'Reported' },
    VERIFIED: { bg: 'bg-blue-100 dark:bg-blue-400/10', text: 'text-blue-700 dark:text-blue-400', label: 'Verified' },
    ASSIGNED: { bg: 'bg-indigo-100 dark:bg-indigo-400/10', text: 'text-indigo-700 dark:text-indigo-400', label: 'Assigned' },
    DISPATCHED: { bg: 'bg-cyan-100 dark:bg-cyan-400/10', text: 'text-cyan-700 dark:text-cyan-400', label: 'Dispatched' },
    IN_PROGRESS: { bg: 'bg-purple-100 dark:bg-purple-400/10', text: 'text-purple-700 dark:text-purple-400', label: 'In Progress' },
    RESOLVED: { bg: 'bg-green-100 dark:bg-green-400/10', text: 'text-green-700 dark:text-green-400', label: 'Resolved' },
    CLOSED: { bg: 'bg-slate-100 dark:bg-slate-400/10', text: 'text-slate-600 dark:text-slate-400', label: 'Closed' },
    FALSE_ALARM: { bg: 'bg-yellow-100 dark:bg-yellow-400/10', text: 'text-yellow-700 dark:text-yellow-400', label: 'False Alarm' },
}

function MediaPreview({ media }: { media: Incident['media'] }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!media || media.length === 0) return null

    const currentMedia = media[currentIndex]
    const isVideo = currentMedia.type === 'VIDEO'

    return (
        <div className="relative rounded-lg overflow-hidden bg-slate-900 h-32">
            {isVideo ? (
                <video src={currentMedia.url} className="w-full h-full object-cover" controls />
            ) : (
                <img src={currentMedia.url} alt="" className="w-full h-full object-cover" />
            )}

            {media.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((i) => (i - 1 + media.length) % media.length)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 size-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCurrentIndex((i) => (i + 1) % media.length)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </>
            )}

            {isVideo && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px] flex items-center gap-1">
                    <Video className="h-2.5 w-2.5" /> Video
                </div>
            )}

            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px]">
                {currentIndex + 1}/{media.length}
            </div>
        </div>
    )
}

function OrganizationDropdown({
    incident,
    onAssign,
}: {
    incident: MapIncident
    onAssign: (orgId: string) => Promise<void>
}) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
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
        } finally {
            setIsAssigning(false)
        }
    }

    const assignedOrg = organizations.find((o) => o.id === incident.primaryOrgId)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-[#3b4254] bg-white dark:bg-[#282d39] text-left flex items-center justify-between gap-2"
            >
                <div className="flex items-center gap-2 text-sm min-w-0">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className={incident.primaryOrgId ? 'text-slate-900 dark:text-white' : 'text-slate-500'}>
                        {incident.primaryOrgId ? assignedOrg?.name || 'Assigned' : 'Assign organization...'}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[1010]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#282d39] border border-slate-200 dark:border-[#3b4254] rounded-lg shadow-xl z-[1020] max-h-48 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        ) : organizations.length === 0 ? (
                            <div className="p-3 text-center text-sm text-slate-500">No organizations</div>
                        ) : (
                            organizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => handleAssign(org.id)}
                                    disabled={isAssigning}
                                    className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#3b4254] text-left ${org.id === incident.primaryOrgId ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="size-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                        {org.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-slate-900 dark:text-white flex-1 truncate">{org.name}</span>
                                    {org.id === incident.primaryOrgId && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export function MapViewPage() {
    const { theme } = useTheme()
    const [incidents, setIncidents] = useState<MapIncident[]>([])
    const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null)
    const [showFilters, setShowFilters] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [mapCenter] = useState<[number, number]>([6.5244, 3.3792])
    const [mapZoom, setMapZoom] = useState(12)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter state
    const hazardTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'STORM', 'LANDSLIDE', 'DROUGHT', 'EPIDEMIC', 'INFRASTRUCTURE', 'SECURITY', 'ACCIDENT', 'OTHER']
    const severityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    const [selectedHazardTypes, setSelectedHazardTypes] = useState<Set<string>>(new Set(hazardTypes))
    const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set(severityLevels))

    useEffect(() => {
        async function fetchIncidents() {
            try {
                const response = await incidentsApi.getAll({ limit: 100 })
                const mapped: MapIncident[] = (response.data || [])
                    .filter(inc => {
                        const lat = inc.location?.latitude
                        const lng = inc.location?.longitude
                        return lat !== null && lat !== undefined && lng !== null && lng !== undefined && (lat !== 0 || lng !== 0)
                    })
                    .map(inc => ({
                        id: inc.id,
                        hazardType: inc.hazardType,
                        severity: inc.severity,
                        status: inc.status,
                        title: inc.title,
                        location: inc.location?.address || 'Unknown',
                        coords: [inc.location.latitude, inc.location.longitude] as [number, number],
                        description: inc.description,
                        createdAt: inc.createdAt,
                        media: inc.media,
                        primaryOrgId: inc.primaryOrgId,
                        communityConfirmations: inc.communityConfirmations,
                    }))
                setIncidents(mapped)
            } catch (err) {
                console.error('Failed to fetch incidents:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchIncidents()
    }, [])

    const handleAssignOrganization = async (incidentId: string, orgId: string) => {
        try {
            await incidentsApi.assign(incidentId, orgId, true)
            setIncidents(prev => prev.map(inc =>
                inc.id === incidentId ? { ...inc, primaryOrgId: orgId } : inc
            ))
            if (selectedIncident?.id === incidentId) {
                setSelectedIncident(prev => prev ? { ...prev, primaryOrgId: orgId } : null)
            }
        } catch (err) {
            console.error('Failed to assign:', err)
        }
    }

    const handleUpdateStatus = async (incidentId: string, status: IncidentStatusType) => {
        try {
            await incidentsApi.updateStatus(incidentId, status)
            setIncidents(prev => prev.map(inc =>
                inc.id === incidentId ? { ...inc, status } : inc
            ))
            if (selectedIncident?.id === incidentId) {
                // If resolving/closing, clear selection to remove from map (since we filter them out)
                if (['RESOLVED', 'CLOSED', 'FALSE_ALARM'].includes(status)) {
                    setSelectedIncident(null)
                    setIncidents(prev => prev.filter(inc => inc.id !== incidentId)) // Remove from local list immediately
                } else {
                    setSelectedIncident(prev => prev ? { ...prev, status } : null)
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }



    // Apply all filters: search, hazard type, and severity
    const filteredIncidents = incidents.filter(inc => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            inc.hazardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.id.includes(searchQuery)

        // Hazard type filter
        const matchesHazardType = selectedHazardTypes.has(inc.hazardType)

        // Severity filter
        const matchesSeverity = selectedSeverities.has(inc.severity)

        return matchesSearch && matchesHazardType && matchesSeverity
    })

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    const countByType = (type: string) => incidents.filter(i => i.hazardType === type && selectedSeverities.has(i.severity)).length
    const countBySeverity = (severity: string) => incidents.filter(i => i.severity === severity && selectedHazardTypes.has(i.hazardType)).length

    const toggleHazardType = (type: string) => {
        setSelectedHazardTypes(prev => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            return next
        })
    }

    const toggleSeverity = (severity: string) => {
        setSelectedSeverities(prev => {
            const next = new Set(prev)
            if (next.has(severity)) {
                next.delete(severity)
            } else {
                next.add(severity)
            }
            return next
        })
    }

    const resetFilters = () => {
        setSelectedHazardTypes(new Set(hazardTypes))
        setSelectedSeverities(new Set(severityLevels))
        setSearchQuery('')
    }

    return (
        <div
            className={`relative w-full overflow-hidden isolate ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
            style={{ margin: '-1rem', width: 'calc(100% + 2rem)', height: 'calc(100% + 2rem)' }}
        >
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-slate-500 dark:text-gray-400">Loading map data...</span>
                    </div>
                </div>
            ) : (
                <>
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        className="w-full h-full !z-0"
                        zoomControl={false}
                        style={{ background: theme === 'dark' ? '#1a1a2e' : '#e2e8f0', position: 'relative', zIndex: 0 }}
                    >
                        <TileLayer
                            key={theme}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url={tileUrl}
                        />
                        <MapController center={mapCenter} zoom={mapZoom} />

                        {filteredIncidents.map((incident) => (
                            <Marker
                                key={incident.id}
                                position={incident.coords}
                                icon={createMarkerIcon(incident.hazardType, incident.severity)}
                                eventHandlers={{
                                    click: () => setSelectedIncident(incident),
                                }}
                            >
                                <Popup>
                                    <div className="text-slate-900 min-w-[150px]">
                                        <strong>{incident.hazardType}</strong>
                                        <br />
                                        <span className="text-sm">{incident.location}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <div className={`fixed lg:absolute top-20 lg:top-4 left-4 w-[calc(100%-2rem)] lg:w-80 flex flex-col gap-3 z-[1001] max-h-[calc(100%-6rem)] lg:max-h-[calc(100%-2rem)] transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'}`}>
                        <div className="bg-white dark:bg-[#1b1f27] rounded-lg shadow-lg border border-slate-200 dark:border-[#282d39] p-2 flex items-center gap-2">
                            <label className="flex w-full items-center gap-2">
                                <div className="text-slate-400 dark:text-[#9ca4ba] pl-2">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#9ca4ba] text-sm h-10 outline-none"
                                    placeholder="Search location, type, ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setSearchQuery('')
                                        }}
                                        className="p-1 text-slate-400 dark:text-[#9ca4ba] hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-[#282d39] transition-colors mr-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </label>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 text-slate-400 dark:text-[#9ca4ba] hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282d39] rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#1b1f27] rounded-xl shadow-xl border border-slate-200 dark:border-[#282d39] overflow-hidden flex flex-col max-h-[60vh]">
                            <div className="p-4 border-b border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#1b1f27]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-slate-900 dark:text-white text-base font-bold">
                                        Incidents ({filteredIncidents.length})
                                    </h3>
                                    <button onClick={resetFilters} className="text-xs text-primary font-medium hover:text-primary/80">Reset</button>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-2 flex flex-col gap-2">
                                <FilterSection title="Hazard Type" defaultOpen>
                                    {hazardTypes.map(type => (
                                        <FilterCheckbox
                                            key={type}
                                            label={type}
                                            count={countByType(type)}
                                            dotColor={hazardColors[type] || '#64748b'}
                                            checked={selectedHazardTypes.has(type)}
                                            onChange={() => toggleHazardType(type)}
                                        />
                                    ))}
                                </FilterSection>
                                <FilterSection title="Severity" defaultOpen>
                                    <FilterCheckbox
                                        label="Critical"
                                        dotColor="#ef4444"
                                        count={countBySeverity('CRITICAL')}
                                        checked={selectedSeverities.has('CRITICAL')}
                                        onChange={() => toggleSeverity('CRITICAL')}
                                    />
                                    <FilterCheckbox
                                        label="High"
                                        dotColor="#f97316"
                                        count={countBySeverity('HIGH')}
                                        checked={selectedSeverities.has('HIGH')}
                                        onChange={() => toggleSeverity('HIGH')}
                                    />
                                    <FilterCheckbox
                                        label="Medium"
                                        dotColor="#eab308"
                                        count={countBySeverity('MEDIUM')}
                                        checked={selectedSeverities.has('MEDIUM')}
                                        onChange={() => toggleSeverity('MEDIUM')}
                                    />
                                    <FilterCheckbox
                                        label="Low"
                                        dotColor="#64748b"
                                        count={countBySeverity('LOW')}
                                        checked={selectedSeverities.has('LOW')}
                                        onChange={() => toggleSeverity('LOW')}
                                    />
                                </FilterSection>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="fixed lg:absolute top-20 lg:top-4 left-4 z-[1000] flex items-center justify-center size-10 bg-white dark:bg-[#1b1f27] rounded-lg shadow-lg border border-slate-200 dark:border-[#282d39] text-slate-600 dark:text-white"
                        style={{ display: showFilters ? 'none' : 'flex' }}
                    >
                        <Filter className="h-5 w-5" />
                    </button>

                    {selectedIncident && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/30 z-[1000] lg:hidden"
                                onClick={() => setSelectedIncident(null)}
                            />
                            <div className="fixed lg:absolute top-20 lg:top-4 bottom-4 right-4 w-[calc(100%-2rem)] lg:w-96 max-w-md bg-white dark:bg-[#1b1f27] border border-slate-200 dark:border-[#282d39] shadow-2xl rounded-xl flex flex-col overflow-hidden z-[1002]">
                                <div className="p-5 border-b border-slate-200 dark:border-[#282d39] flex items-start justify-between bg-slate-50 dark:bg-[#1b1f27]">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${severityStyles[selectedIncident.severity]?.bg} ${severityStyles[selectedIncident.severity]?.text} ring-current/20`}>
                                                {selectedIncident.severity}
                                            </span>
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[selectedIncident.status]?.bg} ${statusStyles[selectedIncident.status]?.text} ring-current/20`}>
                                                {statusStyles[selectedIncident.status]?.label}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {selectedIncident.title || selectedIncident.hazardType}
                                        </h2>
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-sm">ID: #{selectedIncident.id.slice(-6)}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedIncident(null)}
                                        className="text-slate-400 dark:text-[#9ca4ba] hover:text-slate-600 dark:hover:text-white rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-[#282d39]"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                                    {/* Media Preview */}
                                    {selectedIncident.media && selectedIncident.media.length > 0 && (
                                        <MediaPreview media={selectedIncident.media} />
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-xs uppercase tracking-wider font-semibold">Reported</p>
                                        <span className="text-slate-900 dark:text-white text-sm font-medium">
                                            {formatTimeAgo(selectedIncident.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-xs uppercase tracking-wider font-semibold">Location</p>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-slate-400 dark:text-[#9ca4ba] mt-0.5" />
                                            <div>
                                                <p className="text-slate-900 dark:text-white text-sm font-medium">{selectedIncident.location}</p>
                                                <p className="text-slate-500 dark:text-[#9ca4ba] text-xs mt-0.5 font-mono">
                                                    {selectedIncident.coords[0].toFixed(4)}° N, {selectedIncident.coords[1].toFixed(4)}° E
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-xs uppercase tracking-wider font-semibold">Description</p>
                                        <p className="text-slate-700 dark:text-[#e2e8f0] text-sm leading-relaxed">
                                            {selectedIncident.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {/* Organization Assignment */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-xs uppercase tracking-wider font-semibold">Organization</p>
                                        <OrganizationDropdown
                                            incident={selectedIncident}
                                            onAssign={(orgId) => handleAssignOrganization(selectedIncident.id, orgId)}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] flex flex-col gap-3">
                                    {/* Status-aware action buttons */}
                                    {selectedIncident.status === 'REPORTED' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedIncident.id, 'VERIFIED')}
                                                className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                            >
                                                <ShieldCheck className="h-4 w-4" />
                                                Verify Incident
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedIncident.id, 'FALSE_ALARM')}
                                                className="w-full h-9 flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#282d39] hover:bg-slate-200 dark:hover:bg-[#3b4254] text-slate-700 dark:text-white text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-[#3b4254]"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Mark as False Alarm
                                            </button>
                                        </>
                                    )}

                                    {selectedIncident.status === 'VERIFIED' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    if (selectedIncident.primaryOrgId) {
                                                        handleUpdateStatus(selectedIncident.id, 'ASSIGNED')
                                                    }
                                                }}
                                                disabled={!selectedIncident.primaryOrgId}
                                                className="w-full h-10 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Building2 className="h-4 w-4" />
                                                {selectedIncident.primaryOrgId ? 'Assign to Organization' : 'Select Org First'}
                                            </button>
                                        </>
                                    )}

                                    {selectedIncident.status === 'ASSIGNED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'DISPATCHED')}
                                            className="w-full h-10 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            <Truck className="h-4 w-4" />
                                            Dispatch Unit
                                        </button>
                                    )}

                                    {selectedIncident.status === 'DISPATCHED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'IN_PROGRESS')}
                                            className="w-full h-10 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Mark In Progress
                                        </button>
                                    )}

                                    {selectedIncident.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'RESOLVED')}
                                            className="w-full h-10 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
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

                                    {/* Add Note button - always visible for active incidents */}
                                    {!['RESOLVED', 'CLOSED', 'FALSE_ALARM'].includes(selectedIncident.status) && (
                                        <button className="w-full h-9 flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#282d39] hover:bg-slate-200 dark:hover:bg-[#3b4254] text-slate-700 dark:text-white text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-[#3b4254]">
                                            <Edit className="h-4 w-4" />
                                            Add Note
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className={`absolute bottom-6 flex flex-col gap-2 items-end z-[1000] transition-all ${selectedIncident ? 'right-[420px] mr-6 hidden lg:flex' : 'right-6'}`}>
                        <div className="flex flex-col gap-0.5 shadow-lg rounded-lg overflow-hidden">
                            <button
                                onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                                className="flex size-10 items-center justify-center bg-white dark:bg-[#1b1f27] hover:bg-slate-50 dark:hover:bg-[#282d39] text-slate-700 dark:text-white border-b border-slate-200 dark:border-[#282d39] transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setMapZoom((z) => Math.max(z - 1, 3))}
                                className="flex size-10 items-center justify-center bg-white dark:bg-[#1b1f27] hover:bg-slate-50 dark:hover:bg-[#282d39] text-slate-700 dark:text-white transition-colors"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                        </div>
                        <button className="flex size-10 items-center justify-center rounded-lg bg-white dark:bg-[#1b1f27] hover:bg-slate-50 dark:hover:bg-[#282d39] text-slate-700 dark:text-white shadow-lg transition-colors mt-2 border border-slate-200 dark:border-[#282d39]">
                            <Navigation className="h-5 w-5 text-primary" />
                        </button>
                        <button className="flex size-10 items-center justify-center rounded-lg bg-white dark:bg-[#1b1f27] hover:bg-slate-50 dark:hover:bg-[#282d39] text-slate-700 dark:text-white shadow-lg transition-colors border border-slate-200 dark:border-[#282d39]">
                            <Layers className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-6 left-4 bg-white dark:bg-[#1b1f27] rounded-lg shadow-lg border border-slate-200 dark:border-[#282d39] p-3 z-[1000]">
                        <p className="text-xs font-semibold text-slate-700 dark:text-white mb-2">Severity Levels</p>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                                <span className="text-xs text-slate-600 dark:text-slate-300">Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
                                <span className="text-xs text-slate-600 dark:text-slate-300">High</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
                                <span className="text-xs text-slate-600 dark:text-slate-300">Medium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: '#64748b' }} />
                                <span className="text-xs text-slate-600 dark:text-slate-300">Low</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function FilterSection({
    title,
    defaultOpen = false,
    children,
}: {
    title: string
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="group rounded-lg bg-slate-50 dark:bg-[#111318]/50 border border-transparent hover:border-slate-200 dark:hover:border-[#3b4254]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 select-none"
            >
                <span className="text-slate-900 dark:text-white text-sm font-medium">{title}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-[#9ca4ba] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="px-3 pb-3 pt-1 flex flex-col gap-2">{children}</div>}
        </div>
    )
}

function FilterCheckbox({
    label,
    count,
    dotColor,
    checked = false,
    onChange,
}: {
    label: string
    count?: number
    dotColor?: string
    checked?: boolean
    onChange?: () => void
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="rounded border-slate-300 dark:border-[#3b4254] bg-white dark:bg-[#282d39] text-primary focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
            />
            <div className="flex items-center gap-2">
                {dotColor && <div className="size-2 rounded-full" style={{ backgroundColor: dotColor }} />}
                <span className="text-slate-700 dark:text-[#e2e8f0] text-sm">{label}</span>
            </div>
            {count !== undefined && (
                <span className="ml-auto text-xs text-slate-500 dark:text-[#9ca4ba] bg-slate-100 dark:bg-[#282d39] px-1.5 rounded">{count}</span>
            )}
        </label>
    )
}
