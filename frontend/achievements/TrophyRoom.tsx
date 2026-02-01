import React from 'react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { Trophy, Zap, Target, ShieldAlert, Activity, Cpu, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, any> = {
    Zap,
    Target,
    ShieldAlert,
    Activity,
    Cpu,
    Trophy,
    Clock
};

export const TrophyRoom: React.FC = () => {
    const { achievements } = useStore();

    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Trophy className="text-amber-400 w-10 h-10" /> Achievements
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono tracking-[0.3em] mt-2 ml-1 opacity-60 uppercase">Your milestones and progress</p>
                </div>

                <GlassCard className="px-6 py-4 bg-slate-950/40 border-white/5 min-w-[240px]">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Global Completion</span>
                        <span className="text-lg font-black text-white font-mono">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                        />
                    </div>
                    <div className="mt-2 text-[9px] text-slate-600 font-bold uppercase tracking-tighter text-right">
                        {unlockedCount} / {totalCount} Achievements Unlocked
                    </div>
                </GlassCard>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, idx) => {
                    const Icon = ICON_MAP[achievement.icon] || Trophy;
                    const isUnlocked = achievement.isUnlocked;
                    const progress = achievement.progress || 0;
                    const target = achievement.target || 1;
                    const currentPercent = Math.min(100, (progress / target) * 100);

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard
                                className={`h-full p-6 transition-all duration-500 group relative overflow-hidden ${isUnlocked
                                    ? 'bg-slate-900/40 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                                    : 'bg-slate-950/20 border-white/5 opacity-60'
                                    }`}
                                hoverEffect
                            >
                                {/* Background Glow for Unlocked */}
                                {isUnlocked && (
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
                                )}

                                <div className="flex gap-5 items-start relative z-10">
                                    <div className={`p-3 rounded-2xl border transition-all duration-500 ${isUnlocked
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                        : 'bg-slate-900 border-white/5 text-slate-600'
                                        }`}>
                                        {isUnlocked ? <Icon size={24} /> : <Lock size={24} />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${isUnlocked ? 'text-amber-500/70' : 'text-slate-600'
                                                }`}>
                                                {achievement.category}
                                            </span>
                                            {isUnlocked && <CheckCircle2 size={12} className="text-amber-500" />}
                                        </div>
                                        <h4 className={`text-lg font-black tracking-tight uppercase italic ${isUnlocked ? 'text-white' : 'text-slate-500'
                                            }`}>
                                            {achievement.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar for Locked/Partial */}
                                {!isUnlocked && (
                                    <div className="mt-6 space-y-2 relative z-10">
                                        <div className="flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                                            <span>Progress</span>
                                            <span>{progress} / {target}</span>
                                        </div>
                                        <div className="h-1 bg-slate-900/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${currentPercent}%` }}
                                                className="h-full bg-slate-700"
                                            />
                                        </div>
                                    </div>
                                )}

                                {isUnlocked && achievement.unlockedReason && (
                                    <div className="mt-6 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-2">
                                        <div className="flex justify-between items-center text-[8px] font-mono text-amber-500/50 uppercase tracking-widest">
                                            <span>Achievement Details</span>
                                            <span>v{achievement.version}.0</span>
                                        </div>
                                        <p className="text-[10px] text-amber-200/70 font-bold italic leading-tight">
                                            "{achievement.unlockedReason}"
                                        </p>
                                    </div>
                                )}

                                {isUnlocked && !achievement.unlockedReason && (
                                    <div className="mt-6 flex items-center gap-2">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                                        <span className="text-[9px] font-mono text-amber-500/50 uppercase tracking-widest font-black italic">Milestone Completed</span>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
