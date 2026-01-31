import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Copy, Check, Activity, Zap, Crown, Shield, User, X, ChevronRight, MessageSquare, Terminal, Target } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:3000/api';

interface Team {
    id: string;
    name: string;
    code: string;
    role: string;
    memberCount: number;
    taskCount: number;
    members?: any[];
}

interface ActivityItem {
    id: string;
    type: string;
    metadata: string;
    createdAt: string;
    actor: { email: string; level: number };
}

const RoleIcon: React.FC<{ role: string }> = ({ role }) => {
    switch (role) {
        case 'owner': return <Crown size={14} className="text-amber-400" />;
        case 'admin': return <Shield size={14} className="text-cyan-400" />;
        default: return <User size={14} className="text-slate-400" />;
    }
};

const ActivityMessage: React.FC<{ item: ActivityItem }> = ({ item }) => {
    const meta = item.metadata ? JSON.parse(item.metadata) : {};
    const messages: Record<string, string> = {
        team_created: `initialized squadron nexus "${meta.name}"`,
        member_joined: 'linked to squadron uplink',
        task_created: `authorized tactical objective "${meta.title}"`,
        task_completed: `succeeded in objective "${meta.title}"`,
        level_up: `ascended to Rank ${meta.level}! ◈`,
    };
    return <span>{messages[item.type] || item.type}</span>;
};

export const TeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        try {
            const res = await fetch(`${API_BASE}/teams`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
                if (data.length > 0 && !selectedTeam) {
                    setSelectedTeam(data[0]);
                }
            }
        } catch (e) { }
        setLoading(false);
    };

    const fetchActivity = async (teamId: string) => {
        try {
            const res = await fetch(`${API_BASE}/teams/${teamId}/activity`, { credentials: 'include' });
            if (res.ok) {
                setActivity(await res.json());
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            fetchActivity(selectedTeam.id);
        }
    }, [selectedTeam]);

    const createTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newTeamName }),
            });
            if (res.ok) {
                setNewTeamName('');
                setShowCreate(false);
                fetchTeams();
            }
        } catch (e) { }
    };

    const joinTeam = async () => {
        if (!joinCode.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/teams/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: joinCode }),
            });
            if (res.ok) {
                setJoinCode('');
                setShowJoin(false);
                fetchTeams();
            }
        } catch (e) { }
    };

    const copyCode = () => {
        if (selectedTeam) {
            navigator.clipboard.writeText(selectedTeam.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-cyan-400 font-mono text-sm tracking-[0.4em] animate-pulse">RECRUITING SQUADRONS...</div>
                <div className="w-64 h-1 bg-slate-900 overflow-hidden rounded-full">
                    <div className="h-full bg-cyan-500 w-1/2 animate-[shimmer_1.5s_infinite]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Users className="text-cyan-400 w-10 h-10" /> Squadron Tactical Hub
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono tracking-[0.3em] mt-2 ml-1 opacity-60 uppercase">High-Performance Neural Collaboration</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => { setShowJoin(true); setShowCreate(false); }}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-300 font-bold hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogIn size={18} className="group-hover:-translate-x-1 transition-transform" /> Join
                    </button>
                    <button
                        onClick={() => { setShowCreate(true); setShowJoin(false); }}
                        className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Initialize
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <GlassCard className="p-8 border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={80} /></div>
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic">Register New Tactical Unit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest ml-1">Squadron Designation</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="e.g. ALPHA RECON, NEURAL CORE..."
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 px-5 text-lg text-white font-bold focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button onClick={() => setShowCreate(false)} className="flex-1 py-4 bg-slate-800 rounded-xl text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                                    <button onClick={createTeam} className="flex-1 py-4 bg-cyan-600 rounded-xl text-white font-black shadow-lg shadow-cyan-500/20">Establish</button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {showJoin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <GlassCard className="p-8 border-fuchsia-500/30 bg-fuchsia-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic">Link to External Squadron</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest ml-1">Access Protocol Code</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="INPUT 6-STRING KEY"
                                        maxLength={6}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 px-5 text-2xl text-center text-white font-black focus:outline-none focus:border-fuchsia-500/50 transition-all font-mono tracking-[0.5em]"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button onClick={() => setShowJoin(false)} className="flex-1 py-4 bg-slate-800 rounded-xl text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                                    <button onClick={joinTeam} className="flex-1 py-4 bg-fuchsia-600 rounded-xl text-white font-black shadow-lg shadow-fuchsia-500/20">Sync</button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[40px] gap-6">
                    <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                        <Users size={48} className="text-slate-700" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">No Neural Links Established</h3>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Connect with other operators to begin tactical sync</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Team List Sidebar */}
                    <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-4 italic">Available Squadrons</h4>
                        {teams.map((team) => (
                            <button
                                key={team.id}
                                className={`w-full text-left p-5 rounded-[24px] border transition-all relative overflow-hidden group ${selectedTeam?.id === team.id
                                    ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_10px_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20 scale-[1.02]'
                                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/20'
                                    }`}
                                onClick={() => setSelectedTeam(team)}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-xl">
                                        {team.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-extrabold text-white tracking-tight truncate uppercase leading-none">{team.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <RoleIcon role={team.role} />
                                            <span className="text-[9px] font-black font-mono text-slate-500 uppercase tracking-widest">{team.memberCount} UNITS</span>
                                        </div>
                                    </div>
                                </div>
                                {selectedTeam?.id === team.id && (
                                    <motion.div layoutId="active-nav" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Team Workspace */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {selectedTeam ? (
                                <motion.div key={selectedTeam.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <GlassCard className="p-8 border-white/5 bg-slate-950/30 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-transparent to-fuchsia-500 opacity-30"></div>

                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[9px] uppercase tracking-widest rounded-full italic">Operational Base</div>
                                                    <RoleIcon role={selectedTeam.role} />
                                                </div>
                                                <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic decoration-cyan-500/30 underline underline-offset-8">{selectedTeam.name}</h3>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end gap-2 bg-slate-900/50 p-4 rounded-3xl border border-white/5 shadow-2xl">
                                                <span className="text-[9px] text-slate-500 font-black font-mono uppercase tracking-[0.3em]">Access Protocol Link</span>
                                                <div className="flex items-center gap-3">
                                                    <code className="text-2xl font-black text-fuchsia-400 font-mono tracking-[0.2em]">{selectedTeam.code}</code>
                                                    <button onClick={copyCode} className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                                                        {copied ? <Check size={20} transition-all /> : <Copy size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <StatBox label="Tactical Units" value={selectedTeam.memberCount} icon={<Users className="text-cyan-400" />} />
                                            <StatBox label="Active Objects" value={selectedTeam.taskCount} icon={<Target className="text-fuchsia-400" />} />
                                            <StatBox label="Sync Events" value={activity.length} icon={<Activity className="text-emerald-400" />} />
                                        </div>
                                    </GlassCard>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                        {/* Activity Feed */}
                                        <div className="md:col-span-3 space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <MessageSquare size={18} className="text-cyan-400" /> Squadron Transmission Log
                                                </h4>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            </div>
                                            <GlassCard className="p-6 bg-slate-950/40 border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                <div className="space-y-6">
                                                    {activity.length === 0 ? (
                                                        <div className="p-10 text-center text-slate-600 font-mono text-xs uppercase tracking-widest italic grayscale opacity-50">Log is Empty. Awaiting Transmissions.</div>
                                                    ) : (
                                                        activity.map((item) => (
                                                            <div key={item.id} className="flex items-start gap-4 group/item">
                                                                <div className="relative">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-white text-[10px] font-black font-mono shadow-xl relative z-10">
                                                                        {item.actor.email.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="absolute -inset-1 bg-cyan-500/10 rounded-xl blur-md opacity-0 group-hover/item:opacity-100 transition-all"></div>
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-black text-white text-xs uppercase italic tracking-tight">{item.actor.email.split('@')[0]}</span>
                                                                        <span className="text-[9px] text-slate-600 font-mono font-bold">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                                                                        <ActivityMessage item={item} />
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </GlassCard>
                                        </div>

                                        {/* Members List */}
                                        <div className="md:col-span-2 space-y-4">
                                            <h4 className="font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                <Shield size={18} className="text-emerald-400" /> Active Roster
                                            </h4>
                                            <GlassCard className="p-6 bg-slate-950/40 border-white/5 space-y-4">
                                                <div className="space-y-4">
                                                    {/* This would ideally come from the selectedTeam include members */}
                                                    {/* For now, we use a placeholder display or mock */}
                                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><User size={16} /></div>
                                                            <span className="text-xs font-bold text-white uppercase">You (Operator)</span>
                                                        </div>
                                                        <Crown size={14} className="text-amber-400" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 text-center font-mono uppercase tracking-widest mt-8 italic">End of Manifest</p>
                                                </div>
                                            </GlassCard>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center h-full opacity-30 grayscale pointer-events-none">
                                    <div className="text-center space-y-4">
                                        <Users size={80} className="mx-auto" />
                                        <h3 className="text-2xl font-black uppercase italic">Select Tactical Unit</h3>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBox: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] hover:border-white/20 transition-all flex flex-col items-center gap-2 group">
        <div className="p-3 bg-black/40 rounded-2xl mb-1 group-hover:scale-110 transition-transform shadow-xl">{icon}</div>
        <div className="text-4xl font-black text-white tracking-widest font-mono italic">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{label}</div>
    </div>
);
