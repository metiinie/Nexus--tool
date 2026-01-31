import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { TrendingUp, Award, Zap, Activity, Target } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { tasks, habits, user } = useStore();

  // Task Status Distribution
  const taskData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Active', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];

  // Habit Streaks
  const habitData = habits.map(h => ({
    name: h.title.length > 10 ? h.title.substring(0, 10) + '...' : h.title,
    streak: h.streak
  }));

  const COLORS = ['#64748b', '#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div className="flex flex-col space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
          <span className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-cyan-600 rounded-full shadow-[0_0_15px_#10b981]"></span>
          Neural Performance Analytics
        </h2>
        <p className="text-[10px] text-slate-400 font-mono tracking-[0.2em] mt-1 ml-4 uppercase opacity-60">System Throughput & Efficiency Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Zap className="text-cyan-400" />} label="XP Yield" value={user?.xp || 0} sub="Lifetime Gain" />
        <MetricCard icon={<Target className="text-fuchsia-400" />} label="Op Success" value={tasks.filter(t => t.status === 'done').length} sub="Tasks Closed" />
        <MetricCard icon={<Activity className="text-emerald-400" />} label="Routine Sync" value={`${habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) : 0}d`} sub="Avg Streak" />
        <MetricCard icon={<Award className="text-amber-400" />} label="Authority" value={user?.level || 1} sub="Current Rank" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Task Distribution */}
        <GlassCard className="p-6 bg-slate-950/40 border-white/5" hoverEffect>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 italic">Operational Distribution</h3>
            <div className="flex items-center gap-3">
              {taskData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-[9px] text-slate-500 font-bold font-mono">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {taskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Habit Streaks Bar Chart */}
        <GlassCard className="p-6 bg-slate-950/40 border-white/5" hoverEffect>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-400 italic">Neural Integrity Levels</h3>
            <TrendingUp size={16} className="text-fuchsia-500/50" />
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar
                  dataKey="streak"
                  fill="url(#colorStreak)"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <defs>
                  <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3} />
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
  <GlassCard className="p-5 bg-white/[0.02] border-white/5 group" hoverEffect>
    <div className="flex items-start justify-between">
      <div className="bg-white/5 p-2 rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{label}</div>
        <div className="text-2xl font-black text-white font-mono tracking-tighter">{value}</div>
        <div className="text-[9px] text-slate-600 font-bold uppercase mt-1 opacity-60 tracking-tighter">{sub}</div>
      </div>
    </div>
  </GlassCard>
)
