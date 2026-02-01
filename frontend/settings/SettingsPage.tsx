import React, { useState } from 'react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { User, Shield, Monitor, Save, Lock, Smartphone, Palette, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
    const { user, visualPrefs, updateProfile, updateVisualPrefs, changePassword } = useStore();

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profileSaving, setProfileSaving] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        await updateProfile({ name, bio });
        setProfileSaving(false);
    };

    const handleChangePass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPassMsg({ type: 'error', text: 'Cloud Link: Confirm mismatch' });
            return;
        }
        const res = await changePassword({ currentPassword, newPassword });
        if (res.success) {
            setPassMsg({ type: 'success', text: 'Identity shield updated' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPassMsg({ type: 'error', text: res.message });
        }
    };

    return (
        <div className="space-y-10 pb-20 max-w-4xl">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                    <Monitor className="text-cyan-400 w-10 h-10" /> Neural Configuration
                </h2>
                <p className="text-[11px] text-slate-400 font-mono tracking-[0.3em] mt-2 ml-1 opacity-60 uppercase">Identity & Environment Orchestration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <User size={14} /> Identity Manifest
                    </h3>
                    <GlassCard className="p-8 border-white/5 bg-slate-950/30 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Operator CallSign</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Neural Biography</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                placeholder="State your operational intent..."
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none"
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className="w-full py-4 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> {profileSaving ? 'Saving...' : 'Sync Manifest'}
                        </button>
                    </GlassCard>
                </div>

                {/* Visual Settings */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-fuchsia-400 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <Palette size={14} /> Environment Prefs
                    </h3>
                    <GlassCard className="p-8 border-white/5 bg-slate-950/30 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Post-Process Scanlines</h4>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">Toggle CRT radiation effect</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ scanlines: !visualPrefs.scanlines })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.scanlines ? 'bg-cyan-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.scanlines ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Neural Motion</h4>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">UI transitions & animations</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ motion: !visualPrefs.motion })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.motion ? 'bg-fuchsia-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.motion ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Chroma Distortion</h4>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">Abberation layer overlay</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ chromatic: !visualPrefs.chromatic })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.chromatic ? 'bg-emerald-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.chromatic ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Neural Pings</h4>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">System & proactive alerts</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ notifications: !visualPrefs.notifications })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.notifications ? 'bg-amber-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.notifications ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                <span>Signal Intensity</span>
                                <span className="text-cyan-400 font-black">{visualPrefs.intensity}%</span>
                            </div>
                            <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={visualPrefs.intensity}
                                    onChange={(e) => updateVisualPrefs({ intensity: parseInt(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-fuchsia-500 transition-all"
                                    style={{ width: `${visualPrefs.intensity}%` }}
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Security Settings */}
                <div className="space-y-6 md:col-span-2 mt-4">
                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <Shield size={14} /> Security Scrypt
                    </h3>
                    <GlassCard className="p-8 border-white/5 bg-slate-950/30">
                        <form onSubmit={handleChangePass} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Current Protocol Key</label>
                                <input
                                    required
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">New Protocol Key</label>
                                <input
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Confirm Identity Key</label>
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                />
                            </div>
                            <div className="md:col-span-3 flex items-center justify-between">
                                {passMsg && (
                                    <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${passMsg.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${passMsg.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                        {passMsg.text}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="ml-auto px-10 py-3 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-500 font-black uppercase tracking-widest hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Lock size={16} /> Re-Encrypt Identity
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
