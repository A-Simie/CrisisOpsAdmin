import { useState } from 'react'
import {
    Search,
    ChevronRight,
    ChevronDown,
    FolderOpen,
    Folder,
    MapPin,
    Globe,
    Settings as SettingsIcon,
    Monitor,
    Upload,
    CheckCircle,
    Plus,
    X,
} from 'lucide-react'

interface Region {
    name: string
    children: { name: string }[]
}

export function HazardPacksPage() {
    const [regions, setRegions] = useState<Region[]>([
        {
            name: 'Lagos State',
            children: [
                { name: 'Ikeja LGA' },
                { name: 'Epe LGA' },
                { name: 'Badagry LGA' },
            ],
        },
        { name: 'Ogun State', children: [] },
        { name: 'FCT Abuja', children: [] },
    ])

    const [expandedRegions, setExpandedRegions] = useState<string[]>(['Lagos State'])
    const [selectedRegion, setSelectedRegion] = useState('Ikeja LGA')
    const [showAddModal, setShowAddModal] = useState<string | null>(null)
    const [newLocationName, setNewLocationName] = useState('')
    const [showSidebar, setShowSidebar] = useState(false)

    const toggleRegion = (name: string) => {
        setExpandedRegions((prev) =>
            prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
        )
    }

    const addLocation = (regionName: string) => {
        if (!newLocationName.trim()) return
        setRegions((prev) =>
            prev.map((region) =>
                region.name === regionName
                    ? { ...region, children: [...region.children, { name: newLocationName.trim() }] }
                    : region
            )
        )
        if (!expandedRegions.includes(regionName)) {
            setExpandedRegions((prev) => [...prev, regionName])
        }
        setNewLocationName('')
        setShowAddModal(null)
    }

    const stats = [
        { label: 'Resources', value: '12', change: '+2 new added', changeColor: 'text-emerald-500' },
        { label: 'Last Sync', value: 'Oct 24, 14:00', change: 'Automatic', changeColor: 'text-slate-500 dark:text-slate-400' },
        { label: 'File Size', value: '4.2 MB', change: 'Optimized for mobile', changeColor: 'text-slate-500 dark:text-slate-400' },
    ]

    return (
        <div className="flex flex-1 overflow-hidden -m-4 lg:-m-8 h-full">
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:z-auto bg-white dark:bg-[#14181f] border-r border-slate-200 dark:border-[#282d39] flex flex-col shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-[#282d39]/50 flex items-center justify-between">
                    <label className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <input
                            className="placeholder:text-slate-400 dark:placeholder:text-slate-500 block w-full rounded-lg border border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-surface-dark py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:bg-white dark:focus:bg-[#111318] focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Find State or LGA..."
                        />
                    </label>
                    <button
                        onClick={() => setShowSidebar(false)}
                        className="lg:hidden p-2 ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <p className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#9ca4ba] uppercase tracking-wider">
                        Regions Hierarchy
                    </p>
                    <ul className="flex flex-col gap-1">
                        {regions.map((region) => (
                            <li key={region.name}>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleRegion(region.name)}
                                        className="flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-dark"
                                    >
                                        <span className="flex items-center gap-2">
                                            {expandedRegions.includes(region.name) ? (
                                                <FolderOpen className="h-5 w-5 text-slate-400 dark:text-[#9ca4ba]" />
                                            ) : (
                                                <Folder className="h-5 w-5 text-slate-400 dark:text-[#9ca4ba]" />
                                            )}
                                            {region.name}
                                        </span>
                                        {expandedRegions.includes(region.name) ? (
                                            <ChevronDown className="h-4 w-4 text-slate-400 dark:text-[#9ca4ba]" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-[#9ca4ba]" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(region.name)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-400 hover:text-primary transition-colors"
                                        title="Add location"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                {expandedRegions.includes(region.name) && (
                                    <ul className="mt-1 ml-4 border-l border-slate-200 dark:border-[#282d39] pl-2 flex flex-col gap-1">
                                        {region.children.map((child) => (
                                            <li key={child.name}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRegion(child.name)
                                                        setShowSidebar(false)
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${selectedRegion === child.name
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'text-slate-600 dark:text-[#9ca4ba] hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {child.name}
                                                    </span>
                                                    {selectedRegion === child.name && (
                                                        <span className="size-2 rounded-full bg-primary" />
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                        {region.children.length === 0 && (
                                            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 italic">
                                                No locations yet
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-background-dark relative overflow-hidden min-w-0">
                <div
                    className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, #1e59f1 0%, transparent 70%)' }}
                />

                <div className="lg:hidden p-4 pb-0 z-10">
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-[#282d39] text-slate-700 dark:text-white text-sm font-medium"
                    >
                        <Folder className="h-4 w-4" />
                        {selectedRegion}
                    </button>
                </div>

                <div className="flex border-b border-slate-200 dark:border-[#282d39] px-4 lg:px-8 bg-white dark:bg-background-dark z-10 sticky top-0 overflow-x-auto">
                    <button className="relative flex flex-col items-center justify-center px-4 pt-5 pb-4 text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-sm font-bold tracking-[0.015em]">Guides & Content</span>
                        <div className="absolute bottom-0 h-0.5 w-full bg-primary rounded-t-full" />
                    </button>
                    <button className="relative flex flex-col items-center justify-center px-4 pt-5 pb-4 text-slate-500 dark:text-[#9ca4ba] hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-sm font-bold tracking-[0.015em]">Emergency Contacts</span>
                    </button>
                    <button className="relative flex flex-col items-center justify-center px-4 pt-5 pb-4 text-slate-500 dark:text-[#9ca4ba] hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-sm font-bold tracking-[0.015em]">Shelters & Safe Points</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-0">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Guides & Content Resources</h2>
                            <p className="text-slate-500 dark:text-[#9ca4ba]">
                                Manage the educational content and emergency guides distributed to citizens in {selectedRegion}.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-[#282d39] bg-white dark:bg-surface-dark p-6 shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Global Baseline Content</h3>
                                    <p className="text-sm text-slate-500 dark:text-[#9ca4ba]">
                                        This is the default content inherited from the National CrisisOps standard.
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-[#282d39] text-slate-500 dark:text-[#9ca4ba] border border-slate-200 dark:border-[#3b4254] shrink-0">
                                    Read Only
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-[#9ca4ba] uppercase mb-1.5">Source URL</label>
                                <div className="flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] px-3 text-slate-500 dark:text-[#9ca4ba] text-sm">
                                        https://
                                    </span>
                                    <input
                                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] py-2 px-3 text-slate-500 dark:text-[#9ca4ba] opacity-70 text-sm cursor-not-allowed"
                                        disabled
                                        value="api.reliefops.ng/content/v2/baseline-guide.json"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-[#282d39] bg-white dark:bg-surface-dark p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#282d39] relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                            <div className="flex items-start justify-between mb-6 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <SettingsIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Localized Override</h3>
                                        <p className="text-sm text-slate-500 dark:text-[#9ca4ba]">
                                            Custom content specific to {selectedRegion} hazards.
                                        </p>
                                    </div>
                                </div>
                                <label className="flex items-center cursor-pointer shrink-0">
                                    <div className="relative">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="block bg-slate-300 dark:bg-[#282d39] w-12 h-7 rounded-full border border-slate-300 dark:border-[#282d39] peer-checked:bg-primary transition-colors" />
                                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform peer-checked:translate-x-5 shadow-md" />
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white hidden sm:inline">Enabled</span>
                                </label>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9ca4ba] uppercase mb-1.5">
                                        Local Content Source URL
                                    </label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 dark:border-[#282d39] bg-slate-50 dark:bg-[#111318] px-3 text-slate-500 dark:text-[#9ca4ba] text-sm">
                                            https://
                                        </span>
                                        <input
                                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-200 dark:border-[#282d39] bg-white dark:bg-[#111318] py-2 px-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                            defaultValue="cdn.lagos-state.gov/relief/ikeja-flood-guide-v4.json"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Source validated successfully
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9ca4ba] uppercase mb-1.5">
                                        Update Notes (Internal)
                                    </label>
                                    <textarea
                                        className="block w-full rounded-lg border border-slate-200 dark:border-[#282d39] bg-white dark:bg-[#111318] py-2 px-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm"
                                        placeholder="Why is this override being applied?"
                                        rows={3}
                                        defaultValue="Updated evacuation routes for 2024 rainy season protocols per State Directive #44B."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-slate-200 dark:border-[#282d39] bg-white dark:bg-surface-dark p-4 flex flex-col gap-1"
                                >
                                    <span className="text-xs text-slate-500 dark:text-[#9ca4ba] uppercase font-medium">{stat.label}</span>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                                    <span className={`text-xs ${stat.changeColor}`}>{stat.change}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-[#282d39] bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#282d39] text-slate-700 dark:text-white text-sm font-bold transition-colors">
                                <Monitor className="h-4 w-4" />
                                Preview
                            </button>
                            <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                                <Upload className="h-4 w-4" />
                                Publish Changes
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {showAddModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowAddModal(null)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-surface-dark rounded-xl shadow-2xl z-50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Location to {showAddModal}</h3>
                            <button
                                onClick={() => setShowAddModal(null)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newLocationName}
                            onChange={(e) => setNewLocationName(e.target.value)}
                            placeholder="Enter location name (e.g., Gwagwalada LGA)"
                            className="block w-full rounded-lg border border-slate-300 dark:border-[#282d39] bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary text-sm py-2.5 px-3 mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && addLocation(showAddModal)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addLocation(showAddModal)}
                                className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                            >
                                Add Location
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
