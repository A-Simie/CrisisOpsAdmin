import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Pencil, Trash2, Shield, X } from 'lucide-react'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import {
    User,
    UserRoleType,
    getCreatableRoles,
    hasMinimumRole,
    ROLE_LABELS,
} from '../types/api'

interface CreateUserForm {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRoleType
}

export function UsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const creatableRoles = currentUser ? getCreatableRoles(currentUser.role) : []

    const [formData, setFormData] = useState<CreateUserForm>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: creatableRoles[0] || 'RESPONDER',
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const response = await usersApi.getAll()
            setUsers(response.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateError(null)
        setIsCreating(true)

        try {
            await usersApi.create(formData)
            setShowCreateModal(false)
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                role: creatableRoles[0] || 'RESPONDER',
            })
            fetchUsers()
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create user')
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            await usersApi.delete(userId)
            fetchUsers()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user')
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleBadgeColor = (role: UserRoleType) => {
        const colors: Record<UserRoleType, string> = {
            SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            GOV_ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            ORG_ADMIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            DISPATCHER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            RESPONDER: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            CITIZEN: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        }
        return colors[role] || colors.CITIZEN
    }

    if (!currentUser || !hasMinimumRole(currentUser.role, 'ORG_ADMIN')) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">You don't have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage users and their roles
                    </p>
                </div>
                {creatableRoles.length > 0 && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Create User</span>
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search users..."
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
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                        {user.firstName[0]}{user.lastName[0]}
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
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    <Shield className="h-3 w-3" />
                                                    {ROLE_LABELS[user.role]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                                                                Edit User
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete User
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create User</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-4 space-y-4">
                            {createError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                    {createError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Role
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRoleType })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                >
                                    {creatableRoles.map((role) => (
                                        <option key={role} value={role}>
                                            {ROLE_LABELS[role]}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    You can only create users with roles below your own level.
                                </p>
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
                                    {isCreating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
