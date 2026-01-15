import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'
import { incidentsApi } from '../api'
import type { Incident } from '../types/api'
import {
    Search,
    Plus,
    Minus,
    Navigation,
    Layers,
    X,
    MapPin,
    Send,
    Edit,
    CheckCircle,
    ChevronDown,
    Filter,
    Loader2,
} from 'lucide-react'

const createMarkerIcon = (type: string) => {
    const isFlood = type.toLowerCase().includes('flood')
    const isFire = type.toLowerCase().includes('fire')

    const color = isFire ? '#dc2626' : isFlood ? '#1e59f1' : '#f59e0b'
    const icon = isFire
        ? '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
        : isFlood
            ? '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'
            : '<circle cx="12" cy="12" r="8"/>'

    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px ${color}66;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${icon}</svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    })
}

interface MapIncident {
    id: string
    type: string
    severity: Incident['severity']
    status: Incident['status']
    location: string
    coords: [number, number]
    description: string
    createdAt: string
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

export function MapViewPage() {
    const { theme } = useTheme()
    const [incidents, setIncidents] = useState<MapIncident[]>([])
    const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null)
    const [showFilters, setShowFilters] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [mapCenter] = useState<[number, number]>([6.5244, 3.3792])
    const [mapZoom, setMapZoom] = useState(12)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function fetchIncidents() {
            try {
                const response = await incidentsApi.getAll({ limit: 100 })
                const mapped: MapIncident[] = (response.data || [])
                    .filter(inc => inc.location?.latitude && inc.location?.longitude)
                    .map(inc => ({
                        id: inc.id,
                        type: inc.type,
                        severity: inc.severity,
                        status: inc.status,
                        location: inc.location?.address || 'Unknown',
                        coords: [inc.location.latitude, inc.location.longitude] as [number, number],
                        description: inc.description,
                        createdAt: inc.createdAt,
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

    const filteredIncidents = incidents.filter(inc =>
        inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.id.includes(searchQuery)
    )

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    const severityLabel: Record<string, string> = { CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }
    const statusLabel: Record<string, string> = { PENDING: 'Triage Pending', ACTIVE: 'Investigating', RESPONDING: 'Responding', RESOLVED: 'Resolved' }
    const countByType = (type: string) => filteredIncidents.filter(i => i.type.toLowerCase().includes(type.toLowerCase())).length

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
                                icon={createMarkerIcon(incident.type)}
                                eventHandlers={{
                                    click: () => setSelectedIncident(incident),
                                }}
                            >
                                <Popup>
                                    <div className="text-slate-900 min-w-[150px]">
                                        <strong>{incident.type}</strong>
                                        <br />
                                        <span className="text-sm">{incident.location}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <div className={`fixed lg:absolute top-20 lg:top-4 left-4 w-[calc(100%-2rem)] lg:w-80 flex flex-col gap-3 z-[1001] max-h-[calc(100%-6rem)] lg:max-h-[calc(100%-2rem)] transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'}`}>
                        <div className="bg-white dark:bg-[#1b1f27] rounded-lg shadow-lg border border-slate-200 dark:border-[#282d39] p-2">
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
                            </label>
                        </div>

                        <div className="bg-white dark:bg-[#1b1f27] rounded-xl shadow-xl border border-slate-200 dark:border-[#282d39] overflow-hidden flex flex-col max-h-[60vh]">
                            <div className="p-4 border-b border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#1b1f27]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-slate-900 dark:text-white text-base font-bold">
                                        Incidents ({filteredIncidents.length})
                                    </h3>
                                    <button className="text-xs text-primary font-medium hover:text-primary/80">Reset</button>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-2 flex flex-col gap-2">
                                <FilterSection title="Hazard Type" defaultOpen>
                                    <FilterCheckbox label="Fire" count={countByType('fire')} checked />
                                    <FilterCheckbox label="Flood" count={countByType('flood')} checked />
                                    <FilterCheckbox label="Medical" count={countByType('medical')} />
                                </FilterSection>
                                <FilterSection title="Severity" defaultOpen>
                                    <FilterCheckbox label="Critical" dotColor="bg-red-500" checked />
                                    <FilterCheckbox label="High" dotColor="bg-orange-500" checked />
                                    <FilterCheckbox label="Medium" dotColor="bg-yellow-500" />
                                </FilterSection>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="fixed lg:absolute top-20 lg:top-4 left-4 z-[1000] lg:hidden flex items-center justify-center size-10 bg-white dark:bg-[#1b1f27] rounded-lg shadow-lg border border-slate-200 dark:border-[#282d39] text-slate-600 dark:text-white"
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
                                            <span className="inline-flex items-center rounded-md bg-red-100 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-400/20">
                                                {severityLabel[selectedIncident.severity]}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-400/20">
                                                {statusLabel[selectedIncident.status]}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedIncident.type}</h2>
                                        <p className="text-slate-500 dark:text-[#9ca4ba] text-sm">ID: #{selectedIncident.id.slice(-6)}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedIncident(null)}
                                        className="text-slate-400 dark:text-[#9ca4ba] hover:text-slate-600 dark:hover:text-white rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-[#282d39]"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
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
                                </div>

                                <div className="p-4 border-t border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] flex flex-col gap-3">
                                    <button className="w-full h-10 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
                                        <Send className="h-4 w-4" />
                                        Dispatch Unit
                                    </button>
                                    <div className="flex gap-3">
                                        <button className="flex-1 h-9 flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#282d39] hover:bg-slate-200 dark:hover:bg-[#3b4254] text-slate-700 dark:text-white text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-[#3b4254]">
                                            <Edit className="h-4 w-4" />
                                            Add Note
                                        </button>
                                        <button className="flex-1 h-9 flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#282d39] hover:bg-slate-200 dark:hover:bg-[#3b4254] text-slate-700 dark:text-white text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-[#3b4254]">
                                            <CheckCircle className="h-4 w-4" />
                                            Resolve
                                        </button>
                                    </div>
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
}: {
    label: string
    count?: number
    dotColor?: string
    checked?: boolean
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                defaultChecked={checked}
                className="rounded border-slate-300 dark:border-[#3b4254] bg-white dark:bg-[#282d39] text-primary focus:ring-0 focus:ring-offset-0 size-4"
            />
            <div className="flex items-center gap-2">
                {dotColor && <div className={`size-2 rounded-full ${dotColor}`} />}
                <span className="text-slate-700 dark:text-[#e2e8f0] text-sm">{label}</span>
            </div>
            {count !== undefined && (
                <span className="ml-auto text-xs text-slate-500 dark:text-[#9ca4ba] bg-slate-100 dark:bg-[#282d39] px-1.5 rounded">{count}</span>
            )}
        </label>
    )
}
