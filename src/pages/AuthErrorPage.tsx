import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, HelpCircle } from 'lucide-react'

export function AuthErrorPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const message = searchParams.get('message') || 'An unexpected error occurred during authentication.'

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-primary/10 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Header with Icon */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-10 flex flex-col items-center text-center gap-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-inner">
                            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Authentication Failed</h1>
                            <p className="text-red-600 dark:text-red-400 font-semibold mt-1 uppercase tracking-[0.2em] text-[10px]">Access Protocol Rejection</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 text-center">
                        <div className="space-y-3">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic">
                                "{message}"
                            </p>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 w-16 mx-auto" />
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/login', { replace: true })}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Login</span>
                            </button>

                            <a 
                                href="mailto:support@crisisops.com"
                                className="w-full h-12 text-slate-500 dark:text-slate-400 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:text-primary transition-colors"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Contact Support</span>
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-tighter">
                            Security Protocol 09.0-B
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
