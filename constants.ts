export type Priority = 'low' | 'medium' | 'high' | 'critical';

export const XP_PER_TASK = 50;
export const XP_PER_HABIT = 20;

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-slate-400 border-slate-700 bg-slate-400/10',
  medium: 'text-amber-400 border-amber-700 bg-amber-400/10',
  high: 'text-rose-400 border-rose-700 bg-rose-400/10',
  critical: 'text-fuchsia-400 border-fuchsia-700 bg-fuchsia-400/20 shadow-[0_0_10px_rgba(217,70,239,0.3)] animation-pulse',
};

export const STATUS_COLUMNS = [
  { id: 'backlog', label: 'Backlog', icon: 'Archive' },
  { id: 'todo', label: 'Operations', icon: 'Target' },
  { id: 'in-progress', label: 'Active', icon: 'Zap' },
  { id: 'done', label: 'Success', icon: 'CheckCircle' },
];

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getHabitStreak = (completedDates: string[]) => {
  if (!completedDates.length) return 0;
  const dates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const checkDate = new Date();
  checkDate.setUTCHours(0, 0, 0, 0);

  const todayStr = formatDate(checkDate);
  checkDate.setDate(checkDate.getDate() - 1);
  const yesterdayStr = formatDate(checkDate);

  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) return 0;

  let current = dates.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);

  while (dates.includes(formatDate(current))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
};
