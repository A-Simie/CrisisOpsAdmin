import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, Mail, HelpCircle } from 'lucide-react'
import { authApi } from '../api/auth'

type VerificationStatus = 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    
    const [status, setStatus] = useState<VerificationStatus>('verifying')
    const [message, setMessage] = useState('Verifying your account... please hold on.')
    const [errorDetails, setErrorDetails] = useState<string | null>(null)
    
    const otp = searchParams.get('otp')
    const email = searchParams.get('email')
    
    const verificationAttempted = useRef(false)

    useEffect(() => {
        const verify = async () => {
            if (verificationAttempted.current) return
            verificationAttempted.current = true

            if (!otp || !email) {
                setStatus('error')
                setMessage('Invalid verification link.')
                setErrorDetails('The verification token or email is missing from the URL.')
                return
            }

            try {
                await authApi.verifyEmail({ email, otp })
                setStatus('success')
                setMessage('Account Verified! Welcome to CrisisOps.')
            } catch (err) {
                setStatus('error')
                setMessage('Verification Failed')
                setErrorDetails(err instanceof Error ? err.message : 'This link is invalid or has expired.')
            }
        }

        verify()
    }, [email, otp])

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-primary/10 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    
                    {/* Header Section */}
                    <div className={`p-10 flex flex-col items-center text-center gap-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-500 ${
                        status === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 
                        status === 'error' ? 'bg-red-50/50 dark:bg-red-900/10' : 
                        'bg-slate-50/50 dark:bg-slate-900/10'
                    }`}>
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500 ${
                            status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 rotate-0' : 
                            status === 'error' ? 'bg-red-100 dark:bg-red-900/30 rotate-0' : 
                            'bg-primary/10 dark:bg-primary/20 rotate-12'
                        }`}>
                            {status === 'verifying' && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                            {status === 'success' && <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />}
                            {status === 'error' && <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />}
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {status === 'verifying' && 'Security Check'}
                                {status === 'success' && 'Verification Successful'}
                                {status === 'error' && 'Verification Failed'}
                            </h1>
                            <p className={`font-semibold mt-1 uppercase tracking-[0.2em] text-[10px] ${
                                status === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                status === 'error' ? 'text-red-600 dark:text-red-400' :
                                'text-primary'
                            }`}>
                                {status === 'verifying' && 'Authentication Protocol'}
                                {status === 'success' && 'Identity Confirmed'}
                                {status === 'error' && 'Access Rejected'}
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8 text-center">
                        <div className="space-y-3">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic">
                                "{message}"
                            </p>
                            {status === 'error' && errorDetails && (
                                <p className="text-slate-400 dark:text-slate-500 text-sm">
                                    {errorDetails}
                                </p>
                            )}
                            <div className="h-px bg-slate-100 dark:bg-slate-700 w-16 mx-auto" />
                        </div>

                        <div className="space-y-4">
                            {status === 'success' ? (
                                <button
                                    onClick={() => navigate('/login', { replace: true })}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                                >
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : status === 'error' ? (
                                <button
                                    onClick={() => navigate('/login', { replace: true })}
                                    className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <span>Back to Login</span>
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500 py-4">
                                    <Mail className="w-5 h-5 animate-pulse" />
                                    <span className="text-sm font-medium">Communicating with security server...</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <a 
                                    href="mailto:support@crisisops.com"
                                    className="w-full h-12 text-slate-500 dark:text-slate-400 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:text-primary transition-colors"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    <span>Request New Code</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-tighter">
                            Verification Hash: {otp ? otp.slice(0, 4) + '••••' : '0000-XXXX'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
