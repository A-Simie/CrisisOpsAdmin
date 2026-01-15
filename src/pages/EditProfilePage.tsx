import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Save, User, Mail, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'

export function EditProfilePage() {
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    })
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const initials = user?.firstName && user?.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user?.firstName?.[0] || user?.lastName?.[0] || 'U'

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB')
                return
            }
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setIsUpdating(true)
        setError(null)
        try {
            const formData = new FormData()
            if (form.firstName) formData.append('firstName', form.firstName)
            if (form.lastName) formData.append('lastName', form.lastName)
            if (form.phone) formData.append('phone', form.phone)
            if (selectedFile) formData.append('profilePicture', selectedFile)

            const updatedUser = await authApi.updateProfile(formData)
            updateUser(updatedUser)

            // Wait a moment for changes to propagate
            await new Promise(resolve => setTimeout(resolve, 500))
            navigate('/profile')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal information</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card-dark overflow-hidden">
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Profile Picture */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="size-28 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700"
                                />
                            ) : (
                                <div className="size-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-700">
                                    <span className="text-3xl font-bold text-slate-400">
                                        {initials}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                            Click camera to upload photo (max 5MB)
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    placeholder="Enter first name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                                placeholder="+234 812 345 6789"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 font-medium"
                    >
                        <Save className="h-4 w-4" />
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
