import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'
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
} from 'lucide-react'

const stats = [
    {
        label: 'Active Incidents',
        value: '142',
        change: '+12',
        trend: 'up',
        icon: AlertTriangle,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
    },
    {
        label: 'Units Deployed',
        value: '89',
        change: '+5',
        trend: 'up',
        icon: Users,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
    },
    {
        label: 'Resolved Today',
        value: '56',
        change: '+8',
        trend: 'up',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
    },
    {
        label: 'Avg Response',
        value: '14m',
        change: '-2m',
        trend: 'down',
        icon: Timer,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
    },
]

const recentIncidents = [
    {
        id: 'INC-4092',
        type: 'Flash Flood',
        icon: Droplets,
        iconBg: 'bg-blue-500',
        location: 'Lagos Mainland, Yaba',
        time: '12 min ago',
        severity: 'Critical',
        severityClass: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    },
    {
        id: 'INC-4088',
        type: 'Market Fire',
        icon: Flame,
        iconBg: 'bg-orange-500',
        location: 'Balogun Market, Lagos',
        time: '28 min ago',
        severity: 'High',
        severityClass: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    },
    {
        id: 'INC-4075',
        type: 'Road Blockage',
        icon: AlertTriangle,
        iconBg: 'bg-yellow-500',
        location: 'Ikeja GRA, Lagos',
        time: '45 min ago',
        severity: 'Medium',
        severityClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    },
]

const mapIncidents = [
    { coords: [6.5244, 3.3792] as [number, number], severity: 'critical', type: 'Flood', count: 12 },
    { coords: [6.4541, 3.3947] as [number, number], severity: 'high', type: 'Fire', count: 8 },
    { coords: [6.6018, 3.3515] as [number, number], severity: 'medium', type: 'Road', count: 5 },
    { coords: [6.4698, 3.5852] as [number, number], severity: 'critical', type: 'Flood', count: 15 },
    { coords: [6.5833, 3.6000] as [number, number], severity: 'high', type: 'Medical', count: 4 },
]

const activityFeed = [
    { action: 'Incident #4092 assigned to Team Alpha', time: '2 min ago', type: 'assign' },
    { action: 'Hazard Pack updated for Lagos State', time: '15 min ago', type: 'update' },
    { action: 'Incident #4088 verified by dispatch', time: '22 min ago', type: 'verify' },
    { action: '3 new responders deployed to Sector 4', time: '35 min ago', type: 'deploy' },
]

const regionStats = [
    { name: 'Lagos State', incidents: 145, change: '+12%', color: 'bg-red-500' },
    { name: 'Abuja FCT', incidents: 89, change: '+8%', color: 'bg-orange-500' },
    { name: 'Kano State', incidents: 67, change: '-5%', color: 'bg-blue-500' },
    { name: 'Rivers State', incidents: 54, change: '+3%', color: 'bg-emerald-500' },
]

export function OverviewPage() {
    const navigate = useNavigate()
    const { theme } = useTheme()

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return { fill: '#ef4444', stroke: '#dc2626' }
            case 'high': return { fill: '#f97316', stroke: '#ea580c' }
            default: return { fill: '#eab308', stroke: '#ca8a04' }
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, Alex
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's happening across your regions today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    Last updated: 2 min ago
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
                            <span
                                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                    }`}
                            >
                                {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {stat.change}
                            </span>
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
                                <p className="text-sm text-slate-500 dark:text-slate-400">Live incident heatmap</p>
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
                            {mapIncidents.map((incident, i) => {
                                const colors = getSeverityColor(incident.severity)
                                return (
                                    <CircleMarker
                                        key={i}
                                        center={incident.coords}
                                        radius={incident.count + 8}
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
                                                {incident.count} incidents
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
                        {activityFeed.map((item, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="relative">
                                    <div className="size-2 rounded-full bg-primary mt-2" />
                                    {i < activityFeed.length - 1 && (
                                        <div className="absolute top-4 left-[3px] w-px h-full bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{item.action}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        ))}
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
                        {recentIncidents.map((incident) => (
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
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151922] p-4 lg:p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <MapPin className="h-5 w-5 text-purple-500" />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">By Region</h2>
                        </div>
                        <div className="space-y-3">
                            {regionStats.map((region) => (
                                <div key={region.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{region.name}</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{region.incidents}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${region.color} rounded-full`}
                                            style={{ width: `${(region.incidents / 145) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
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
                                    <p className="text-lg font-bold">99.9%</p>
                                    <p className="text-[10px] text-white/70">Uptime</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                    <p className="text-lg font-bold">24ms</p>
                                    <p className="text-[10px] text-white/70">Latency</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                    <p className="text-lg font-bold">847</p>
                                    <p className="text-[10px] text-white/70">API/hr</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
