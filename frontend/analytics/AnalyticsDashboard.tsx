import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { TrendingUp, Award, Zap, Activity, Target } from 'lucide-react';
import { getHabitStreak } from '../../constants';

export const AnalyticsDashboard: React.FC = () => {
  const { tasks, habits, user } = useStore();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Task Status Distribution
  const taskData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Active', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ].filter(d => d.value > 0);

  // Habit Streaks
  const habitData = habits.slice(0, 5).map(h => ({
    name: h.title.length > 8 ? h.title.substring(0, 6) + '..' : h.title,
    streak: getHabitStreak(h.completedDates)
  }));

  const COLORS = ['#64748b', '#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 pb-32 md:pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
          <span className="w-1.5 h-6 md:h-8 bg-gradient-to-b from-emerald-400 to-cyan-600 rounded-full shadow-[0_0_15px_#10b981]"></span>
          Performance Overview
        </h2>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-mono tracking-[0.2em] mt-1 ml-4 uppercase opacity-60">Your progress and statistics</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <MetricCard icon={<Zap className="text-cyan-400" size={16} />} label="XP" value={user?.xp || 0} sub="EARNED" />
        <MetricCard icon={<Target className="text-fuchsia-400" size={16} />} label="TASKS" value={tasks.filter(t => t.status === 'done').length} sub="COMPLETED" />
        <MetricCard icon={<Activity className="text-emerald-400" size={16} />} label="STREAK" value={`${habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + getHabitStreak(h.completedDates), 0) / habits.length) : 0}d`} sub="AVERAGE" />
        <MetricCard icon={<Award className="text-amber-400" size={16} />} label="LEVEL" value={user?.level || 1} sub="CURRENT" />
      </div>

      {/* Main Analysis Sections */}
      <div className="flex flex-col gap-6 md:gap-8 mt-4">
        {/* Operational Flow (Redesigned for Mobile) */}
        <GlassCard className="p-5 md:p-8 bg-slate-950/40 border-white/5" hoverEffect>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 italic">Task Distribution</h3>
              <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Breakdown of current task statuses</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {taskData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: COLORS[i], backgroundColor: COLORS[i] }}></div>
                  <span className="text-[9px] text-slate-400 font-black font-mono uppercase">{d.name}</span>
                  <span className="text-[9px] text-white font-bold tabular-nums">({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[200px] md:h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 65 : 85}
                  outerRadius={isMobile ? 90 : 120}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1000}
                >
                  {taskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', fontWeight: '900', backdropFilter: 'blur(10px)', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label for Mobile - Integrated Look */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total</div>
              <div className="text-2xl font-black text-white font-mono tracking-tighter">{tasks.length}</div>
            </div>
          </div>
        </GlassCard>

        {/* Neural Integrity (Compact Bar for Mobile) */}
        <GlassCard className="p-5 md:p-8 bg-slate-950/40 border-white/5" hoverEffect>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-400 italic">Habit Consistency</h3>
              <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Current daily streaks for your habits</p>
            </div>
            <TrendingUp size={16} className="text-fuchsia-500/50" />
          </div>

          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}
                />
                <YAxis
                  hide={isMobile}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: '900' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', backdropFilter: 'blur(10px)' }}
                />
                <Bar
                  dataKey="streak"
                  fill="url(#colorStreak)"
                  radius={[6, 6, 0, 0]}
                  barSize={isMobile ? 24 : 40}
                  animationBegin={200}
                />
                <defs>
                  <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, sub: string }> = ({ icon, label, value, sub }) => (
  <GlassCard className="p-3 md:p-5 bg-white/[0.01] border-white/5 active:bg-white/[0.03] transition-all" hoverEffect>
    <div className="flex items-center lg:items-start justify-between gap-2">
      <div className="bg-slate-900 border border-white/5 p-1.5 md:p-2.5 rounded-xl text-cyan-400 shrink-0">
        {icon}
      </div>
      <div className="text-right min-w-0">
        <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5 truncate">{label}</div>
        <div className="text-lg md:text-2xl font-black text-white font-mono tracking-tighter tabular-nums leading-none">{value}</div>
        <div className="text-[7px] md:text-[9px] text-slate-600 font-bold uppercase mt-1 opacity-60 tracking-tighter truncate">{sub}</div>
      </div>
    </div>
  </GlassCard>
)
