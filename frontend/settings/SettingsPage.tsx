import React, { useState, useEffect } from 'react';
import { useStore, API_BASE } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { User, Shield, Monitor, Save, Lock, Smartphone, Palette, Eye, EyeOff, Terminal, Settings2, Bell, Moon, Mail, Brain, History, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
    const { user, visualPrefs, updateProfile, updateVisualPrefs, changePassword, achievements, updateAchievementDefinition } = useStore();

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
                <h2 className="text-2xl md:text-4xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                    <Monitor className="text-cyan-400 w-8 h-8 md:w-10 md:h-10" /> Configure Neural Link
                </h2>
                <p className="text-[10px] md:text-[11px] text-slate-400 font-mono tracking-[0.3em] mt-2 ml-1 opacity-60 uppercase">Identity & Environment Orchestration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Profile Settings */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <User size={14} /> Identity manifest
                    </h3>
                    <GlassCard className="p-4 md:p-8 border-white/5 bg-slate-950/30 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Operator CallSign</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Neural Biography</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                placeholder="State your operational intent..."
                                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className="w-full py-4 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Save size={16} /> {profileSaving ? 'Syncing...' : 'Update Manifest'}
                        </button>
                    </GlassCard>
                </div>

                {/* Visual Settings */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-fuchsia-400 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <Palette size={14} /> Operational Environment
                    </h3>
                    <GlassCard className="p-4 md:p-8 border-white/5 bg-slate-950/30 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Post-Process Scanlines</h4>
                                <p className="text-[9px] text-slate-500 font-mono uppercase">Toggle CRT radiation effect</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ scanlines: !visualPrefs.scanlines })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.scanlines ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.scanlines ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Neural Motion</h4>
                                <p className="text-[9px] text-slate-500 font-mono uppercase">UI transitions & animations</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ motion: !visualPrefs.motion })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.motion ? 'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.motion ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Chroma Distortion</h4>
                                <p className="text-[9px] text-slate-500 font-mono uppercase">Abberation layer overlay</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ chromatic: !visualPrefs.chromatic })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.chromatic ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.chromatic ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Low Power Mode</h4>
                                <p className="text-[9px] text-slate-500 font-mono uppercase">Optimize for low-end hardware</p>
                            </div>
                            <button
                                onClick={() => updateVisualPrefs({ lowPower: !visualPrefs.lowPower, intensity: !visualPrefs.lowPower ? 30 : 100 })}
                                className={`w-12 h-6 rounded-full transition-all relative ${visualPrefs.lowPower ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visualPrefs.lowPower ? 'left-7' : 'left-1'}`} />
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

                {/* Notification Intelligence Matrix */}
                <NotificationIntelligenceSection />

                {/* Security Settings & 2FA */}
                <div className="space-y-6 md:col-span-2 mt-4">
                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                        <Shield size={14} /> Security Scrypt
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Password Change */}
                        <GlassCard className="p-8 border-white/5 bg-slate-950/30 lg:col-span-2">
                            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Lock size={12} /> Access Protocol Update
                            </h4>
                            <form onSubmit={handleChangePass} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Current Protocol Key</label>
                                        <input
                                            required
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all font-bold"
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
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold"
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
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    {passMsg && (
                                        <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${passMsg.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${passMsg.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                            {passMsg.text}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="ml-auto px-8 py-3 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-500 font-black uppercase tracking-widest hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Update Shield
                                    </button>
                                </div>
                            </form>
                        </GlassCard>

                        {/* 2FA Section */}
                        <TwoFactorSection />
                    </div>
                </div>

                {/* System Admin Section (Vanguard Only) */}
                {user?.role === 'admin' && (
                    <div className="space-y-6 md:col-span-2 mt-10 p-8 bg-slate-900/40 border border-cyan-500/20 rounded-3xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                                    <Terminal size={14} /> Vanguard Admin Console
                                </h3>
                                <p className="text-[10px] text-slate-500 font-mono uppercase mt-1 ml-2">Achievement Metadata & Synchronization Protocol</p>
                            </div>
                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                                <span className="text-[9px] font-black text-cyan-500 uppercase">Privileged Session</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-6">
                            {achievements.map(achievement => (
                                <AdminAchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    onUpdate={(data) => updateAchievementDefinition(achievement.id, data)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NotificationIntelligenceSection: React.FC = () => {
    const { user, updateProfile } = useStore();
    const [audit, setAudit] = useState<any[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

    const [prefs, setPrefs] = useState<Record<string, string[]>>(() => {
        try { return JSON.parse(user?.notificationPrefs || '{"critical_deadline":["in_app","email"],"habit_at_risk":["in_app"]}'); }
        catch (e) { return {}; }
    });

    const [qh, setQh] = useState(() => {
        try { return JSON.parse(user?.quietHours || '{"enabled":false,"start":"22:00","end":"08:00"}'); }
        catch (e) { return { enabled: false, start: '22:00', end: '08:00' }; }
    });

    const [saving, setSaving] = useState(false);

    const fetchAudit = async () => {
        setLoadingAudit(true);
        try {
            const res = await fetch(`${API_BASE}/user/notifications/audit`, { credentials: 'include' });
            if (res.ok) setAudit(await res.json());
        } catch (e) { }
        setLoadingAudit(false);
    };

    useEffect(() => {
        fetchAudit();
    }, []);

    const togglePref = (type: string, channel: string) => {
        const current = prefs[type] || [];
        const next = current.includes(channel) ? current.filter(c => c !== channel) : [...current, channel];
        const nextPrefs = { ...prefs, [type]: next };
        setPrefs(nextPrefs);
        save(nextPrefs, qh);
    };

    const toggleQuietHours = () => {
        const nextQh = { ...qh, enabled: !qh.enabled };
        setQh(nextQh);
        save(prefs, nextQh);
    };

    const save = async (p: any, q: any) => {
        setSaving(true);
        await updateProfile({
            notificationPrefs: JSON.stringify(p),
            quietHours: JSON.stringify(q)
        });
        setSaving(false);
    };

    return (
        <div className="space-y-6 md:col-span-2">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-2">
                <Brain size={14} /> Intelligence Matrix
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Prefs Matrix */}
                <GlassCard className="p-8 border-white/5 bg-slate-950/30 lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Bell size={12} /> Delivery Protocols
                        </h4>
                        {saving && <Loader2 size={12} className="text-amber-500 animate-spin" />}
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'critical_deadline', label: 'Critical Deadlines', icon: 'Shield' },
                            { id: 'habit_at_risk', label: 'Streak Protection', icon: 'Zap' },
                            { id: 'system_alert', label: 'System Logic', icon: 'Monitor' }
                        ].map(type => (
                            <div key={type.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold text-white uppercase tracking-tight">{type.label}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => togglePref(type.id, 'in_app')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${prefs[type.id]?.includes('in_app') ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                                    >
                                        In-App
                                    </button>
                                    <button
                                        onClick={() => togglePref(type.id, 'email')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${prefs[type.id]?.includes('email') ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                                    >
                                        Email
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                        <p className="text-[9px] text-amber-500/70 font-mono uppercase leading-relaxed">
                            <span className="font-black">Deduplication Active:</span> Multiple events within 2h are automatically suppressed to prevent pattern noise.
                        </p>
                    </div>
                </GlassCard>

                {/* Quiet Hours */}
                <GlassCard className="p-8 border-white/5 bg-slate-950/30 space-y-6">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Moon size={12} /> Neural Focus
                    </h4>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Quiet Hours</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">Suppress non-urgent pings</p>
                        </div>
                        <button
                            onClick={toggleQuietHours}
                            className={`w-12 h-6 rounded-full transition-all relative ${qh.enabled ? 'bg-amber-500' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${qh.enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className={`space-y-4 transition-all ${qh.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-slate-600 uppercase tracking-widest pl-1">Start</label>
                                <input
                                    type="time"
                                    value={qh.start}
                                    onChange={(e) => {
                                        const nextQh = { ...qh, start: e.target.value };
                                        setQh(nextQh);
                                        save(prefs, nextQh);
                                    }}
                                    className="w-full bg-slate-900 border border-white/5 rounded-lg px-2 py-2 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-slate-600 uppercase tracking-widest pl-1">End</label>
                                <input
                                    type="time"
                                    value={qh.end}
                                    onChange={(e) => {
                                        const nextQh = { ...qh, end: e.target.value };
                                        setQh(nextQh);
                                        save(prefs, nextQh);
                                    }}
                                    className="w-full bg-slate-900 border border-white/5 rounded-lg px-2 py-2 text-xs text-white font-mono outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter leading-tight italic">
                            * Urgent (Critical) alerts bypass focus windows for mission safety.
                        </p>
                    </div>
                </GlassCard>

                {/* Audit Log / History */}
                <GlassCard className="p-8 border-white/5 bg-slate-950/30 lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <History size={12} /> Neural Echo Log (Last 10 Signals)
                        </h4>
                        <button onClick={fetchAudit} disabled={loadingAudit} className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center gap-1 uppercase">
                            {loadingAudit ? 'Refreshing...' : 'Manual Sync'}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {audit.length === 0 ? (
                            <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                                <p className="text-[10px] text-slate-600 font-mono uppercase">Signal silence. No recent history detected.</p>
                            </div>
                        ) : (
                            audit.map((entry, idx) => (
                                <motion.div
                                    key={entry.id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${entry.channel === 'suppressed' ? 'bg-slate-700' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'}`} />
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">
                                                {entry.type.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-mono uppercase flex items-center gap-2">
                                                <span className={entry.channel === 'suppressed' ? 'text-slate-600' : 'text-amber-500/80'}>{entry.channel}</span>
                                                <span className="opacity-30">•</span>
                                                <span>{entry.reason}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600 italic">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const AdminAchievementCard: React.FC<{ achievement: any, onUpdate: (data: any) => Promise<void> }> = ({ achievement, onUpdate }) => {
    const [target, setTarget] = useState(achievement.target);
    const [saving, setSaving] = useState(false);

    const handleUpdate = async () => {
        setSaving(true);
        await onUpdate({ target: parseInt(target) });
        setSaving(false);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
            <div className="flex-1">
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{achievement.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">Key: <span className="text-cyan-500/70">{achievement.key}</span> • Version: {achievement.version}.0</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block ml-1">Threshold</label>
                    <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-20 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-center text-white font-bold focus:border-cyan-500/50 outline-none"
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={saving || parseInt(target) === achievement.target}
                    className="p-2 bg-cyan-600/10 border border-cyan-500/20 rounded-lg text-cyan-500 hover:bg-cyan-600/20 transition-all disabled:opacity-30"
                >
                    <Settings2 size={16} className={saving ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );
};

const TwoFactorSection: React.FC = () => {
    const { user, setup2FA, enable2FA } = useStore();
    const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');
    const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartSetup = async () => {
        setLoading(true);
        try {
            const data = await setup2FA();
            setQrData(data);
            setStep('setup');
        } catch (e) {
            setError('Failed to initialize 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        setLoading(true);
        setError('');
        const res = await enable2FA(token);
        if (res.success) {
            setStep('status');
            setQrData(null);
            setToken('');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <GlassCard className="p-8 border-white/5 bg-slate-950/30 flex flex-col">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Smartphone size={12} /> Neural 2FA
            </h4>

            <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                {step === 'status' && (
                    <>
                        <div className="flex justify-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${user?.twoFactorEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-white/10 text-slate-500'}`}>
                                <Shield size={32} className={user?.twoFactorEnabled ? 'animate-pulse' : ''} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Status: {user?.twoFactorEnabled ? 'Active Protection' : 'Unprotected'}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Multi-factor authorization</p>
                        </div>
                        {!user?.twoFactorEnabled && (
                            <button
                                onClick={handleStartSetup}
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-black uppercase tracking-widest hover:bg-emerald-600/30 transition-all text-[11px]"
                            >
                                {loading ? 'Initializing...' : 'Enable Encryption'}
                            </button>
                        )}
                    </>
                )}

                {step === 'setup' && qrData && (
                    <div className="space-y-6">
                        <div className="bg-white p-2 rounded-xl inline-block mx-auto shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <img src={qrData.qrCode} alt="2FA QR" className="w-32 h-32" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-400 font-mono uppercase leading-relaxed">
                                Scan with Authenticator App<br />
                                <span className="text-[9px] opacity-50 select-all font-bold text-cyan-400 underline">{qrData.secret}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setStep('verify')}
                            className="w-full py-3 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all text-[11px]"
                        >
                            Next: Verify
                        </button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Authentication Code</label>
                            <input
                                autoFocus
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 text-center text-white focus:outline-none focus:border-cyan-500/50 transition-all font-black text-xl tracking-[0.5em]"
                            />
                        </div>
                        {error && (
                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tight">{error}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('setup')}
                                className="flex-1 py-3 bg-slate-800 border border-white/10 rounded-xl text-slate-400 font-black uppercase tracking-widest hover:bg-slate-700 transition-all text-[11px]"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleVerifyAndEnable}
                                disabled={loading || token.length !== 6}
                                className="flex-[2] py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-black uppercase tracking-widest hover:bg-emerald-600/30 transition-all text-[11px] disabled:opacity-50"
                            >
                                {loading ? 'Authorizing...' : 'Authorize'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
