import React, { useState } from 'react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { User, Mail, Lock, Shield, Zap, Terminal, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const setAuth = useStore(state => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { email, password, name };

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
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
                // data is the user object directly from AuthController.login
                setAuth(data);
            } else {
                // Registration succeeded, now perform login to get the cookie
                const loginRes = await fetch(`http://localhost:3000/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });

                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    setAuth(loginData);
                } else {
                    setIsLogin(true);
                    setError('Identity initialized. Please access uplink.');
                }
            }
        } catch (err: any) {
            console.error('[Auth] uplink failure:', err);
            setError(err.message);
        } finally {
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
                            <Shield className="text-cyan-400 w-8 h-8" />
                        </div>
                    </div>
                </div>

                <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            {isLogin ? 'Neural Uplink' : 'Account Registry'}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] mt-2 uppercase">
                            {isLogin ? 'Accessing Secure Tactical Protocol' : 'Initializing New Operator Identity'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">CallSign / Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. ALPHA_COMMANDER"
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Encryption Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@nexus.sys"
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Access Protocol Key</label>
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
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-head-shake">
                                <Activity className="text-rose-500 w-4 h-4" />
                                <p className="text-[11px] text-rose-200 font-bold uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Zap className="animate-spin text-white w-5 h-5" />
                            ) : (
                                <>
                                    {isLogin ? 'Establish Uplink' : 'Initialize Protocol'}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] text-slate-500 font-black uppercase tracking-widest hover:text-cyan-400 transition-colors"
                        >
                            {isLogin ? "Need a New Identity? Register" : "Existing Operator? Log In"}
                        </button>
                    </div>
                </GlassCard>

                <div className="mt-8 flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                        <Shield size={10} /> 256-Bit Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                        <Terminal size={10} /> System V3.0.4
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
