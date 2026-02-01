import React, { useState } from 'react';
import { useStore, API_BASE } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { User, Mail, Lock, Shield, Zap, Terminal, ChevronRight, Activity, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgot, setShowForgot] = useState(false);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [tempUserId, setTempUserId] = useState('');

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const setAuth = useStore(state => state.setAuth);
    const verify2FA = useStore(state => state.verify2FALogin);
    const forgotPassword = useStore(state => state.forgotPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (showForgot) {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccess(result.message);
                setShowForgot(false);
            } else {
                setError(result.message);
            }
            setLoading(false);
            return;
        }

        if (twoFactorRequired) {
            const result = await verify2FA(tempUserId, twoFactorToken);
            if (!result.success) {
                setError(result.message);
                setLoading(false);
            }
            return;
        }

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { email, password, name };

        try {
            // endpoint starts with /api/auth/...
            // API_BASE is .../api
            // We need to be careful with double /api
            const cleanBase = API_BASE.replace(/\/api$/, '');
            const response = await fetch(`${cleanBase}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            if (isLogin) {
                if (data.twoFactorRequired) {
                    setTwoFactorRequired(true);
                    setTempUserId(data.userId);
                    setLoading(false);
                } else {
                    setAuth(data);
                }
            } else {
                setSuccess('Account created. Please verify your email before signing in.');
                setIsLogin(true);
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[Auth] uplink failure:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="w-16 h-16 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-2xl relative">
                            {twoFactorRequired ? <Shield className="text-emerald-400 w-8 h-8" /> : <Shield className="text-cyan-400 w-8 h-8" />}
                        </div>
                    </div>
                </div>

                <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            {twoFactorRequired ? 'Two-Factor Auth' : showForgot ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] mt-2 uppercase">
                            {twoFactorRequired ? 'Enter your 2FA code' : showForgot ? 'Enter your email to reset password' : isLogin ? 'Sign in to your account' : 'Create a new account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {twoFactorRequired ? (
                                <motion.div
                                    key="2fa"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest ml-1">Authentication Code</label>
                                        <div className="relative">
                                            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                            <input
                                                required
                                                autoFocus
                                                type="text"
                                                maxLength={6}
                                                value={twoFactorToken}
                                                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                                                placeholder="000000"
                                                className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 tracking-[1em] text-center transition-all font-bold placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    {!isLogin && !showForgot && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your name"
                                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {!showForgot && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                                <input
                                                    required
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                                />
                                            </div>
                                            {isLogin && (
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowForgot(true)}
                                                        className="text-[9px] text-slate-500 hover:text-cyan-400 font-mono uppercase tracking-widest transition-colors"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-head-shake">
                                <Activity className="text-rose-500 w-4 h-4" />
                                <p className="text-[11px] text-rose-200 font-bold uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                <CheckCircle className="text-emerald-500 w-4 h-4" />
                                <p className="text-[11px] text-emerald-200 font-bold uppercase tracking-tight">{success}</p>
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 group disabled:opacity-50 ${twoFactorRequired ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20' : 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-500/20'
                                }`}
                        >
                            {loading ? (
                                <Zap className="animate-spin text-white w-5 h-5" />
                            ) : (
                                <>
                                    {twoFactorRequired ? 'Authorize' : showForgot ? 'Request Reset' : isLogin ? 'Sign In' : 'Register'}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {twoFactorRequired && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTwoFactorRequired(false);
                                    setTwoFactorToken('');
                                }}
                                className="w-full text-[10px] text-slate-500 hover:text-white font-mono uppercase tracking-widest py-2"
                            >
                                Back to Login
                            </button>
                        )}

                        {showForgot && (
                            <button
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="w-full text-[10px] text-slate-500 hover:text-white font-mono uppercase tracking-widest py-2"
                            >
                                Back to Login
                            </button>
                        )}
                    </form>

                    {!twoFactorRequired && !showForgot && (
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-[11px] text-slate-500 font-black uppercase tracking-widest hover:text-cyan-400 transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log In"}
                            </button>
                        </div>
                    )}
                </GlassCard>

                <div className="mt-8 flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                        <Shield size={10} /> 256-Bit Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                        <Terminal size={10} /> System V4.1.0
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
