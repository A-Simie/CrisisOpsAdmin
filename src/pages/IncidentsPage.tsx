import { useState } from 'react'
import {
    Search,
    RefreshCw,
    ChevronDown,
    Check,
    Droplets,
    Flame,
    Stethoscope,
    Wrench,
    Camera,
    Video,
    ShieldCheck,
    UserPlus,
    MapPin,
    X,
    Send,
    Copy,
    CheckCircle,
} from 'lucide-react'

const incidents = [
    {
        id: '8892',
        time: '10:42 AM',
        ago: '-20m ago',
        agoClass: 'text-red-500',
        type: 'Flash Flood',
        icon: Droplets,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        severity: 'CRITICAL',
        severityClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
        location: 'Lagos Mainland, Yaba',
        status: 'Triage Pending',
        statusDot: 'bg-orange-500 animate-pulse',
        hasMedia: true,
        hasVideo: false,
        verified: true,
        assignee: null,
    },
    {
        id: '8891',
        time: '10:15 AM',
        ago: '-45m ago',
        agoClass: 'text-slate-500',
        type: 'Market Fire',
        icon: Flame,
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        severity: 'HIGH',
        severityClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
        location: 'Abuja Municipal, Garki',
        status: 'Investigating',
        statusDot: 'bg-blue-500',
        hasMedia: false,
        hasVideo: true,
        verified: false,
        assignee: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    {
        id: '8880',
        time: '09:30 AM',
        ago: '-1h 30m',
        agoClass: 'text-slate-500',
        type: 'Medical Emergency',
        icon: Stethoscope,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        iconColor: 'text-slate-600 dark:text-slate-400',
        severity: 'MEDIUM',
        severityClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        location: 'Kano Municipal',
        status: 'Resolved',
        statusDot: 'bg-green-500',
        hasMedia: false,
        hasVideo: false,
        verified: false,
        assignee: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
        id: '8875',
        time: '08:45 AM',
        ago: '-2h 15m',
        agoClass: 'text-slate-500',
        type: 'Bridge Collapse',
        icon: Wrench,
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        severity: 'CRITICAL',
        severityClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
        location: 'Port Harcourt, Rivers',
        status: 'Investigating',
        statusDot: 'bg-blue-500',
        hasMedia: true,
        hasVideo: false,
        verified: false,
        assignee: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    },
]

export function IncidentsPage() {
    const [selectedIncident, setSelectedIncident] = useState<typeof incidents[0] | null>(incidents[0])

    return (
        <div className="flex flex-col h-full overflow-hidden relative -m-4 lg:-m-8">
            <div className="flex flex-col gap-4 p-4 lg:p-6 pb-2 shrink-0 bg-white dark:bg-[#111318]">
                <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                            Incidents Triage Queue
                        </h1>
                        <p className="text-slate-500 dark:text-[#9ca4ba] text-sm font-normal leading-normal">
                            Real-time feed. <span className="text-primary font-bold">42 New items</span> since last refresh.
                        </p>
                    </div>
                    <button className="flex h-9 items-center justify-center gap-x-2 rounded-lg bg-primary hover:bg-blue-600 text-white px-4 transition-colors shrink-0">
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-sm font-medium">Refresh Feed</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-3 items-center w-full">
                    <div className="relative flex-1 min-w-[150px] max-w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-[#9ca4ba]" />
                        <input
                            className="w-full bg-slate-100 dark:bg-[#282d39] text-slate-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none border-none placeholder:text-slate-400 dark:placeholder:text-[#9ca4ba]"
                            placeholder="Search..."
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

                    {incidents.map((incident) => (
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
                                    {incident.time}
                                </span>
                                <span className={`text-xs font-medium ${incident.agoClass}`}>{incident.ago}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`size-8 shrink-0 rounded-full ${incident.iconBg} flex items-center justify-center ${incident.iconColor}`}>
                                    <incident.icon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-slate-900 dark:text-white font-medium text-sm truncate">{incident.type}</span>
                                    <span className="text-xs text-slate-500">ID: #{incident.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${incident.severityClass}`}>
                                    {incident.severity}
                                </span>
                            </div>
                            <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm min-w-0">
                                <span className="truncate">{incident.location}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center gap-1.5">
                                    <span className={`size-2 shrink-0 rounded-full ${incident.statusDot}`} />
                                    <span className="text-slate-700 dark:text-white text-sm truncate">{incident.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                                {incident.hasMedia && <Camera className="h-4 w-4 text-slate-400" />}
                                {incident.hasVideo && <Video className="h-4 w-4 text-slate-400" />}
                                {incident.verified && <ShieldCheck className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex items-center justify-end">
                                {incident.assignee ? (
                                    <div
                                        className="size-8 rounded-full bg-slate-200 dark:bg-[#282d39] bg-cover bg-center border border-white dark:border-[#111318]"
                                        style={{ backgroundImage: `url('${incident.assignee}')` }}
                                    />
                                ) : (
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-[#282d39] border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedIncident && (
                <>
                    <div
                        className="fixed inset-0  z-40"
                        onClick={() => setSelectedIncident(null)}
                    />
                    <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-[#161a23] border-l border-slate-200 dark:border-[#282d39] flex flex-col shadow-2xl z-50">
                        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Incident #{selectedIncident.id}
                                    </h2>
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded font-medium">
                                        NEW
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Reported via Mobile App • 20 mins ago</p>
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
                                <img
                                    className="w-full h-full object-cover opacity-80"
                                    src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&h=400&fit=crop"
                                    alt="Map location"
                                />
                                <div className="absolute bottom-3 left-3 bg-white dark:bg-[#111318] px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium flex items-center gap-1.5 text-slate-900 dark:text-white">
                                    <MapPin className="h-3 w-3 text-red-500" />
                                    {selectedIncident.location}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-xs text-slate-500 mb-1">Hazard Type</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                        <selectedIncident.icon className="h-4 w-4 text-blue-500" />
                                        {selectedIncident.type}
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-xs text-slate-500 mb-1">Estimated Impact</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedIncident.severityClass}`}>
                                            {selectedIncident.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Reporter Description</h3>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1a1d26] border border-slate-200 dark:border-[#282d39]">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        "Water levels rising rapidly near the marketplace. Several stalls are already submerged. We need help evacuating the goods and elderly people nearby."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 border-t border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] flex flex-col gap-3">
                            <button className="w-full h-10 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                                <Send className="h-4 w-4" />
                                Dispatch Responder
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="w-full h-10 rounded-lg border border-slate-200 dark:border-[#282d39] hover:bg-white dark:hover:bg-[#282d39] text-slate-700 dark:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Verify
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
