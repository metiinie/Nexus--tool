import React from 'react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { Zap, Target, TrendingUp, Trophy, ShieldCheck } from 'lucide-react';

export const GamificationBar: React.FC = () => {
  const { user, tasks, habits, isSyncing } = useStore();

  if (!user) {
    return (
      <GlassCard className="p-6 bg-slate-950/40 border-white/5 backdrop-blur-2xl">
        <div className="flex items-center justify-center gap-4 py-4">
          <Zap className="text-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">Initializing Neural Handshake...</span>
        </div>
      </GlassCard>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const syncRate = habits.length > 0
    ? Math.round((habits.filter(h => h.streak > 0).length / habits.length) * 100)
    : 0;

  const progressPercent = Math.min(100, Math.max(0, (user.xp / (user.nextLevelXP || 100)) * 100));

  return (
    <GlassCard className="p-6 bg-slate-950/40 border-white/5 backdrop-blur-2xl overflow-hidden" hoverEffect>
      {/* Dynamic Background Scanning Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">

        {/* User Identity Section */}
        <div className="flex items-center gap-5 min-w-[320px]">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center relative overflow-hidden group/avatar">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-fuchsia-400">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                <ShieldCheck className="text-cyan-400" size={24} />
              </div>
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-1 border border-white/10 shadow-xl">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-black text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                LVL {user.level}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-cyan-400 font-mono tracking-[0.2em] font-bold uppercase italic">
                {isSyncing ? 'Synchronizing Ident...' : 'Uplink Established'}
              </p>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic decoration-cyan-500/50 underline-offset-4 decoration-2">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Experience Progression */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Experience Protocol</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white font-mono tabular-nums">{user.xp}</span>
              <span className="text-[10px] text-slate-500 font-mono ml-1 uppercase">/ {user.nextLevelXP || 100} XP</span>
            </div>
          </div>
          <div className="relative h-3 bg-slate-900/80 rounded-full border border-white/5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-fuchsia-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Tactical Metrics Card */}
        <div className="flex gap-4 lg:pl-8 lg:border-l border-white/10">
          <Metric icon={<Target className="text-cyan-400" />} label="Completed" value={completedTasks} />
          <Metric icon={<TrendingUp className="text-emerald-400" />} label="Sync Rate" value={`${syncRate}%`} />
          <Metric icon={<Trophy className="text-fuchsia-400" />} label="Total Ops" value={tasks.length} />
        </div>

      </div>
    </GlassCard>
  );
};

const Metric: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center min-w-[70px]">
    <div className="mb-1 opacity-80">{icon}</div>
    <div className="text-xl font-black text-white font-mono leading-none tracking-tighter">{value}</div>
    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1 opacity-60">{label}</div>
  </div>
);
