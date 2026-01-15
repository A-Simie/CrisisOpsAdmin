import { useState, useEffect } from 'react'
import { Plus, Search, Building2, MoreVertical, Power, PowerOff, X } from 'lucide-react'
import { organizationsApi } from '../api/organizations'
import { useAuth } from '../context/AuthContext'
import { Organization, hasMinimumRole } from '../types/api'

type OrganizationType = 'NGO' | 'GOVERNMENT' | 'PRIVATE' | 'MULTI_STATE'
type OrganizationTier = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

interface CreateOrgForm {
    name: string
    type: OrganizationType
    tier: OrganizationTier
}

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
    NGO: 'NGO',
    GOVERNMENT: 'Government',
    PRIVATE: 'Private',
    MULTI_STATE: 'Multi-State',
}

const ORG_TIER_LABELS: Record<OrganizationTier, string> = {
    BASIC: 'Basic',
    PREMIUM: 'Premium',
    ENTERPRISE: 'Enterprise',
}

export function OrganizationsPage() {
    const { user: currentUser } = useAuth()
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const [formData, setFormData] = useState<CreateOrgForm>({
        name: '',
        type: 'GOVERNMENT',
        tier: 'BASIC',
    })

    useEffect(() => {
        fetchOrganizations()
    }, [])

    const fetchOrganizations = async () => {
        try {
            setIsLoading(true)
            const data = await organizationsApi.getAll()
            setOrganizations(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateError(null)
        setIsCreating(true)

        try {
            await organizationsApi.create(formData)
            setShowCreateModal(false)
            setFormData({ name: '', type: 'GOVERNMENT', tier: 'BASIC' })
            fetchOrganizations()
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create organization')
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggleActive = async (org: Organization) => {
        try {
            if (org.isActive) {
                await organizationsApi.deactivate(org.id)
            } else {
                await organizationsApi.activate(org.id)
            }
            fetchOrganizations()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update organization')
        }
    }

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            GOVERNMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            NGO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            PRIVATE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            MULTI_STATE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        }
        return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }

    if (!currentUser || !hasMinimumRole(currentUser.role, 'GOV_ADMIN')) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">You don't have permission to view this page.</p>
            </div>
        )
    }

    const canCreateOrgs = hasMinimumRole(currentUser.role, 'SUPER_ADMIN')

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organizations</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage organizations and their configurations
                    </p>
                </div>
                {canCreateOrgs && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Create Organization</span>
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search organizations..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrgs.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                            No organizations found
                        </div>
                    ) : (
                        filteredOrgs.map((org) => (
                            <div
                                key={org.id}
                                className={`bg-white dark:bg-slate-800 rounded-xl border ${org.isActive
                                        ? 'border-slate-200 dark:border-slate-700'
                                        : 'border-red-200 dark:border-red-900/50 opacity-60'
                                    } p-4 relative`}
                            >
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === org.id ? null : org.id)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                    {activeDropdown === org.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                                            <button
                                                onClick={() => handleToggleActive(org)}
                                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${org.isActive
                                                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                            >
                                                {org.isActive ? (
                                                    <>
                                                        <PowerOff className="h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {org.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(org.type)}`}>
                                                {ORG_TYPE_LABELS[org.type as OrganizationType] || org.type}
                                            </span>
                                            {!org.isActive && (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                    Created {new Date(org.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Organization</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrg} className="p-4 space-y-4">
                            {createError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                    {createError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    placeholder="Lagos Fire Service"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as OrganizationType })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                >
                                    {Object.entries(ORG_TYPE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Tier
                                </label>
                                <select
                                    required
                                    value={formData.tier}
                                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as OrganizationTier })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                >
                                    {Object.entries(ORG_TIER_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
