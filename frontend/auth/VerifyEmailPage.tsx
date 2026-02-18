import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Shield, CheckCircle, XCircle, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const verifyEmail = useStore(state => state.verifyEmail);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Token missing.');
            return;
        }

        const runVerify = async () => {
            const result = await verifyEmail(token);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        };

        runVerify();
    }, [searchParams, verifyEmail]);

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className={`absolute -inset-4 rounded-full blur-2xl animate-pulse ${status === 'loading' ? 'bg-cyan-500/20' :
                                    status === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                }`}></div>
                            <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center relative">
                                {status === 'loading' && <Loader2 className="text-cyan-400 w-8 h-8 animate-spin" />}
                                {status === 'success' && <CheckCircle className="text-emerald-400 w-8 h-8" />}
                                {status === 'error' && <XCircle className="text-rose-400 w-8 h-8" />}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-2">
                        {status === 'loading' ? 'Verifying Neural Link' :
                            status === 'success' ? 'Link Established' : 'Uplink Failure'}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase mb-8">
                        Identity Verification Protocol
                    </p>

                    <div className={`p-4 rounded-xl border mb-8 ${status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' :
                            status === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' :
                                'bg-white/5 border-white/10 text-slate-400'
                        }`}>
                        <p className="text-sm font-bold uppercase tracking-tight">
                            {status === 'loading' ? 'Processing security handshake...' : message}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] transition-all"
                    >
                        Back to Uplink
                    </button>
                </GlassCard>

                <div className="mt-8 flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                        <Shield size={10} /> Secure Identity Verification
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
