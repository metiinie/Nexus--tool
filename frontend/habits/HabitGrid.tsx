import React, { useState } from 'react';
import { Check, Flame, Activity, Plus, Trash2, X, ChevronRight, Target, Calendar } from 'lucide-react';
import { useStore } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { formatDate } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

const COLOR_OPTIONS = [
  { id: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { id: 'fuchsia', bg: 'bg-fuchsia-500', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'amber', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-700/30' },
  { id: 'violet', bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/30' },
];

export const HabitGrid: React.FC = () => {
  const { habits, addHabit, toggleHabitForDate, deleteHabit } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const today = formatDate(new Date());

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: formatDate(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: formatDate(d) === today
    };
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addHabit(newTitle);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
            <span className="w-1.5 h-8 bg-gradient-to-b from-fuchsia-400 to-purple-600 rounded-full shadow-[0_0_15px_#d946ef]"></span>
            Neural Routine Sync
          </h2>
          <p className="text-[10px] text-slate-400 font-mono tracking-[0.2em] mt-1 ml-4 uppercase opacity-60">Consistency Protocol Matrix</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm
            ${isAdding
              ? 'bg-rose-500/10 border border-rose-500/50 text-rose-400'
              : 'bg-fuchsia-600 border border-fuchsia-400 text-white shadow-[0_4px_15px_rgba(217,70,239,0.3)] hover:scale-105 active:scale-95'}
          `}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          <span>{isAdding ? 'Abort' : 'New Habit'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <form onSubmit={handleCreate} className="mb-8">
              <GlassCard className="p-6 border-fuchsia-500/30 bg-fuchsia-500/5">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest ml-1">Routine Descriptor</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g., Morning Meditation, Deep Work..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all font-medium placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto px-10 py-3 bg-fuchsia-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-fuchsia-500 shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all"
                  >
                    Establish
                  </button>
                </div>
              </GlassCard>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {habits.length === 0 ? (
          <GlassCard className="p-16 text-center border-dashed border-white/5 opacity-50 space-y-4">
            <Calendar size={48} className="mx-auto text-slate-700" />
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No neural routines established</p>
          </GlassCard>
        ) : (
          habits.map((habit, index) => {
            const colorSet = COLOR_OPTIONS[index % COLOR_OPTIONS.length];

            return (
              <GlassCard key={habit.id} className="p-0 flex flex-col lg:flex-row overflow-hidden group border-white/5 hover:border-white/10 transition-all" hoverEffect>
                {/* Info Panel */}
                <div className="p-5 md:p-6 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b lg:border-b-0 lg:border-r border-white/5 gap-4">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={`p-3 md:p-4 rounded-2xl bg-${colorSet.id}-500/10 ${colorSet.text} group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.4)] shrink-0`}>
                      <Activity size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white tracking-tight truncate">{habit.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                          <Flame size={12} className="text-orange-500 animate-pulse" />
                          <span className="text-[10px] text-orange-400 font-black font-mono uppercase italic shrink-0">{habit.streak} Day Continuous</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="self-end sm:self-center p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Grid Panel */}
                <div className="p-4 md:p-5 flex items-center justify-between lg:justify-end gap-2 md:gap-3 bg-white/[0.02] overflow-x-auto no-scrollbar scroll-smooth snap-x">
                  {last7Days.map((day) => {
                    const isCompleted = habit.completedDates.includes(day.dateStr);

                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-2.5">
                        <span className={`text-[9px] font-black font-mono tracking-tighter uppercase ${day.isToday ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {day.isToday ? 'TOD' : day.dayName}
                        </span>
                        <button
                          onClick={() => toggleHabitForDate(habit.id, day.dateStr)}
                          className={`
                              w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group/tile shrink-0 snap-center
                              ${isCompleted
                              ? `${colorSet.bg} text-slate-900 shadow-[0_0_25px_rgba(0,0,0,0.5)] scale-100 ring-2 ring-white/20`
                              : 'bg-slate-900 border border-white/5 text-slate-700 hover:text-slate-100 hover:border-white/20 hover:scale-105 active:scale-95'}
                            `}
                        >
                          {isCompleted ? (
                            <Check size={24} strokeWidth={4} className="animate-in fade-in zoom-in duration-300" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover/tile:bg-slate-400 transition-colors"></div>
                          )}

                          {/* Today Glow */}
                          {day.isToday && !isCompleted && (
                            <div className="absolute inset-0 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"></div>
                          )}
                        </button>
                        <span className={`text-[9px] font-mono ${day.isToday ? 'text-cyan-600' : 'text-slate-800'}`}>
                          {day.dayNum < 10 ? `0${day.dayNum}` : day.dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )
          })
        )}
      </div>
    </div>
  );
};
