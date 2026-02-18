import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Lock, Shield, Zap, ChevronRight, Activity, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const resetPassword = useStore(state => state.resetPassword);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        setStatus('idle');

        const result = await resetPassword({ token, newPassword: password });
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setStatus('error');
            setMessage(result.message);
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center">
                <p className="text-rose-400 font-mono text-sm tracking-widest uppercase">Unauthorized: Neural Reset Token Missing</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-fuchsia-500/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="w-16 h-16 bg-slate-900 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center shadow-2xl relative">
                                    <Lock className="text-fuchsia-400 w-8 h-8" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Neural Reset
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] mt-2 uppercase">
                            Overwrite Access Protocol
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="space-y-6 text-center">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <CheckCircle className="text-emerald-400 w-12 h-12 mx-auto mb-4" />
                                <p className="text-sm text-emerald-200 font-bold uppercase tracking-tight">Access Key Overwritten</p>
                                <p className="text-[10px] text-emerald-400/60 font-mono mt-2 uppercase tracking-widest">Redirecting to Uplink...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">New Access Key</label>
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Confirm Identity Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                    <input
                                        required
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-head-shake">
                                    <Activity className="text-rose-500 w-4 h-4" />
                                    <p className="text-[11px] text-rose-200 font-bold uppercase tracking-tight">{message}</p>
                                </div>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-fuchsia-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-white w-5 h-5" />
                                ) : (
                                    <>
                                        Authorize Update
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};
