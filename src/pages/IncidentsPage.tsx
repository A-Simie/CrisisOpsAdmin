import { useState, useEffect, useCallback } from 'react'
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
    Copy,
    CheckCircle,
    Loader2,
} from 'lucide-react'
import { incidentsApi } from '../api'
import type { Incident } from '../types/api'
import type { LucideIcon } from 'lucide-react'

const typeIcons: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
    'Flash Flood': { icon: Droplets, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    'Flood': { icon: Droplets, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    'Fire': { icon: Flame, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    'Market Fire': { icon: Flame, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    'Medical Emergency': { icon: Stethoscope, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    'Bridge Collapse': { icon: Wrench, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    'Infrastructure': { icon: Wrench, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
}

const defaultIcon = { icon: AlertTriangle, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400' }

const severityClasses: Record<Incident['severity'], string> = {
    CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
    HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

const statusStyles: Record<Incident['status'], { dot: string; label: string }> = {
    PENDING: { dot: 'bg-orange-500 animate-pulse', label: 'Triage Pending' },
    ACTIVE: { dot: 'bg-blue-500', label: 'Investigating' },
    RESPONDING: { dot: 'bg-purple-500', label: 'Responding' },
    RESOLVED: { dot: 'bg-green-500', label: 'Resolved' },
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

export function IncidentsPage() {
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

    const handleUpdateStatus = async (incidentId: string, status: Incident['status']) => {
        try {
            const updated = await incidentsApi.updateStatus(incidentId, status)
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updated : inc))
            if (selectedIncident?.id === incidentId) setSelectedIncident(updated)
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }

    const handleConfirm = async (incidentId: string) => {
        try {
            const updated = await incidentsApi.confirm(incidentId)
            setIncidents(prev => prev.map(inc => inc.id === incidentId ? updated : inc))
            if (selectedIncident?.id === incidentId) setSelectedIncident(updated)
        } catch (err) {
            console.error('Failed to confirm incident:', err)
        }
    }

    const filteredIncidents = incidents.filter(inc =>
        inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.id.includes(searchQuery)
    )

    const newCount = incidents.filter(i => i.status === 'PENDING').length

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
                            Real-time feed. <span className="text-primary font-bold">{newCount} Pending</span> items require attention.
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
                            const typeIcon = typeIcons[incident.type] || defaultIcon
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
                                            <span className="text-slate-900 dark:text-white font-medium text-sm truncate">{incident.type}</span>
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
                                        {incident.mediaUrls && incident.mediaUrls.length > 0 && <Camera className="h-4 w-4 text-slate-400" />}
                                        {incident.mediaUrls?.some(u => u.includes('video')) && <Video className="h-4 w-4 text-slate-400" />}
                                        {incident.verified && <ShieldCheck className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <div className="flex items-center justify-end">
                                        {incident.assignedTo ? (
                                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                {incident.assignedTo.slice(0, 2).toUpperCase()}
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
                                    {selectedIncident.status === 'PENDING' && (
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
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#282d39] bg-slate-200 dark:bg-[#282d39] relative h-48">
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                                    <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                </div>
                                <div className="absolute bottom-3 left-3 bg-white dark:bg-[#111318] px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium flex items-center gap-1.5 text-slate-900 dark:text-white">
                                    <MapPin className="h-3 w-3 text-red-500" />
                                    {selectedIncident.location?.address || 'Unknown location'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-xs text-slate-500 mb-1">Hazard Type</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                        {(() => {
                                            const { icon: Icon, iconColor } = typeIcons[selectedIncident.type] || defaultIcon
                                            return <Icon className={`h-4 w-4 ${iconColor}`} />
                                        })()}
                                        {selectedIncident.type}
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
                            <button
                                onClick={() => handleUpdateStatus(selectedIncident.id, 'RESPONDING')}
                                className="w-full h-10 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Send className="h-4 w-4" />
                                Dispatch Responder
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleConfirm(selectedIncident.id)}
                                    disabled={selectedIncident.verified}
                                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {selectedIncident.verified ? 'Verified' : 'Verify'}
                                </button>
                                <button className="w-full h-10 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Duplicate
                                </button>
                            </div>
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
