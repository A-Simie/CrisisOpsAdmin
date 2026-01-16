import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Pencil, Trash2, Landmark, X, MapPin } from 'lucide-react'
import { usersApi } from '../api/users'
import { organizationsApi } from '../api/organizations'
import {
    User,
} from '../types/api'

interface CreateGovAdminForm {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    state: string
    country: string
}

interface Country {
    name: string
    iso2: string
    iso3: string
}

interface State {
    name: string
    state_code: string
}

export function GovAdminsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const [formData, setFormData] = useState<CreateGovAdminForm>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        state: '',
        country: '',
    })

    // Location Data State
    const [countries, setCountries] = useState<Country[]>([])
    const [availableStates, setAvailableStates] = useState<State[]>([])
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const usersResponse = await usersApi.getAll(undefined, undefined, 'GOV_ADMIN')

            if (Array.isArray(usersResponse)) {
                setUsers(usersResponse)
            } else if (usersResponse && 'data' in usersResponse && Array.isArray((usersResponse as any).data)) {
                setUsers((usersResponse as any).data)
            } else {
                setUsers([])
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso')
                const data = await response.json()
                if (!data.error && data.data) {
                    setCountries(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch countries", err)
            }
        }
        fetchCountries()
        fetchData()
    }, [])

    // Handle Country Change -> Fetch States
    const handleCountryChange = async (countryName: string) => {
        setFormData(prev => ({ ...prev, country: countryName, state: '' }))
        setAvailableStates([])
        if (!countryName) return

        setIsLoadingLocation(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName }),
                signal: controller.signal
            })
            clearTimeout(timeoutId)
            const data = await response.json()
            if (!data.error && data.data && data.data.states) {
                setAvailableStates(data.data.states)
            }
        } catch (err) {
            console.error("Failed to fetch states", err)
            // Error handling for timeout or network failure is handled by showing text input fallback in UI
        } finally {
            setIsLoadingLocation(false)
        }
    }

    const handleCreateGovAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateError(null)
        setIsCreating(true)

        try {
            // 1. Determine Organization Name
            const orgName = `${formData.state} Government`

            // 2. Check if Org Exists
            const existingOrgs = await organizationsApi.getAll(orgName)
            let targetOrgId = existingOrgs.find(o => o.name === orgName)?.id

            // 3. Create Org if it doesn't exist
            if (!targetOrgId) {
                const newOrg = await organizationsApi.create({
                    name: orgName,
                    type: 'GOVERNMENT',
                    tier: 'ENTERPRISE', // Govts usually get top tier
                    contactEmail: formData.email,
                    contactPhone: formData.phone, // Use real phone num
                    headquarters: {
                        address: `${formData.state} Government House`,
                        city: formData.state === 'Lagos' ? 'Ikeja' : 'Capital City',
                        state: formData.state,
                        country: formData.country,
                        latitude: 0,
                        longitude: 0
                    } as any,
                    serviceArea: {
                        states: [formData.state],
                        cities: [],
                        radiusKm: 500
                    } as any
                })
                targetOrgId = newOrg.id
            }

            // 4. Create User
            await usersApi.create({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: 'GOV_ADMIN',
                orgId: targetOrgId
            })

            setShowCreateModal(false)
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                state: '',
                country: '',
            })
            fetchData()
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create government admin')
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return
        try {
            await usersApi.delete(userId)
            fetchData()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user')
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Government Officials</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage jurisdiction administrators
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>Onboard Official</span>
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search officials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Official</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jurisdiction</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                            No government officials found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                                        <Landmark className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    {/* In a real app we would fetch the Org name, for now infer from filtering or just show Check Details */}
                                                    <span className="text-sm font-medium">View Details</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="relative flex justify-end">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                    {activeDropdown === user.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Revoke Access
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl transform transition-all flex flex-col max-h-[90vh]">
                        <div className="flex-none flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Onboard Government Official</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Assign an administrator to a jurisdiction.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGovAdmin} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {createError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                                        {createError}
                                    </div>
                                )}

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">Automatic Inheritance</h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                The official will automatically gain oversight of all organizations within the selected jurisdiction (e.g. Police, Fire Stations, Hospitals in {formData.state || 'the state'}).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                                        Jurisdiction
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Country
                                            </label>
                                            <select
                                                required
                                                value={formData.country}
                                                onChange={(e) => handleCountryChange(e.target.value)}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all"
                                            >
                                                <option value="">Select Country...</option>
                                                {countries.map((c, idx) => (
                                                    <option key={`${c.iso3 || 'c'}-${idx}`} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                State / Region <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                {!isLoadingLocation && availableStates.length === 0 && formData.country ? (
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter state manually..."
                                                        value={formData.state}
                                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    />
                                                ) : (
                                                    <select
                                                        required
                                                        disabled={!formData.country || isLoadingLocation}
                                                        value={formData.state}
                                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">{isLoadingLocation ? 'Loading states...' : 'Select State...'}</option>
                                                        {availableStates.map((s, idx) => (
                                                            <option key={`${s.state_code || 's'}-${idx}`} value={s.name}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                {isLoadingLocation && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                                        Official Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Musa"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Yar'Adua"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="e.g. 08012345678"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                                        Account Access
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="official@state.gov.ng"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-none flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Onboard Official
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
