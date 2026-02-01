import React from 'react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { Zap, Target, TrendingUp, Trophy, ShieldCheck } from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const GamificationBar: React.FC = () => {
  const { user, tasks, habits, isSyncing, isOnline, lastSyncAt } = useStore();

  if (!user) {
    return (
      <GlassCard className="p-6 bg-slate-950/40 border-white/5 backdrop-blur-2xl">
        <div className="flex items-center justify-center gap-4 py-4">
          <Zap className="text-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">Loading Profile...</span>
        </div>
      </GlassCard>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const getStreak = (dates: string[]) => {
    if (!dates.length) return 0;
    const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let current = today;
    let streak = 0;

    // Check if dates includes today or yesterday
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const todayStr = fmt(today);
    const yesterdayStr = fmt(new Date(today.getTime() - 86400000));

    if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) return 0;

    current = sorted.includes(todayStr) ? today : new Date(today.getTime() - 86400000);

    while (sorted.includes(fmt(current))) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    }
    return streak;
  };

  const syncRate = habits.length > 0
    ? Math.round((habits.filter(h => getStreak(h.completedDates) > 0).length / habits.length) * 100)
    : 0;

  const progressPercent = Math.min(100, Math.max(0, (user.xp / (user.nextLevelXP || 100)) * 100));

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Pending First Sync';
    const date = new Date(dateStr);
    return `Last Sync: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <GlassCard className="p-6 bg-slate-950/40 border-white/5 backdrop-blur-2xl overflow-hidden" hoverEffect>
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 px-4 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-[0.3em] border-l border-b border-rose-500/30 z-20 animate-pulse">
          Offline Mode Active
        </div>
      )}

      {/* Dynamic Background Scanning Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center relative z-10">

        {/* User Identity Section */}
        <div className="flex items-center gap-4 w-full lg:w-auto lg:min-w-[320px]">
          <div className="relative shrink-0">
            <div className={`absolute -inset-1 bg-gradient-to-tr ${isOnline ? 'from-cyan-500 to-fuchsia-500' : 'from-slate-500 to-slate-700'} rounded-full blur-sm opacity-50 animate-pulse`}></div>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center relative overflow-hidden group/avatar">
              <span className={`text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr ${isOnline ? 'from-cyan-400 to-fuchsia-400' : 'from-slate-400 to-slate-600'}`}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-white/10 shadow-xl">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-[8px] md:text-[10px] font-black text-black px-1.5 md:px-2 py-0.5 rounded-full">
                L{user.level}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 lg:flex-none">
            <p className={`text-[9px] font-mono tracking-[0.2em] font-bold uppercase italic truncate ${isSyncing ? 'text-amber-400 animate-pulse' : isOnline ? 'text-cyan-400' : 'text-slate-500'}`}>
              {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
            </p>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase italic truncate">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></div>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-mono tracking-widest uppercase truncate">
                {isOnline ? formatLastSync(lastSyncAt) : 'Operation Running Locally'}
              </p>
            </div>
          </div>

          {/* Mobile Only Notification Center */}
          <div className="lg:hidden ml-auto">
            <NotificationCenter />
          </div>
        </div>

        {/* Experience Progression */}
        <div className="w-full lg:flex-1 space-y-2 lg:space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Experience Points</span>
            </div>
            <div className="text-right">
              <span className="text-base lg:text-lg font-black text-white font-mono tabular-nums">{user.xp}</span>
              <span className="text-[9px] text-slate-500 font-mono ml-1 uppercase">/ {user.nextLevelXP || 100}</span>
            </div>
          </div>
          <div className="relative h-2 lg:h-3 bg-slate-900/80 rounded-full border border-white/5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-fuchsia-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Tactical Metrics Card */}
        <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-6 w-full lg:w-auto lg:pl-8 lg:border-l border-white/10">
          <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            <Metric icon={<Target className="text-cyan-400" size={14} />} label="Tasks" value={completedTasks} />
            <Metric icon={<TrendingUp className="text-emerald-400" size={14} />} label="Habits" value={`${syncRate}%`} />
            <Metric icon={<Trophy className="text-fuchsia-400" size={14} />} label="Total" value={tasks.length} />
          </div>
          <div className="hidden lg:block h-10 w-[1px] bg-white/5 mx-2" />
          <div className="hidden lg:block">
            <NotificationCenter />
          </div>
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
