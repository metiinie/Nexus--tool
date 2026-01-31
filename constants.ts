import { Priority } from "./types";

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
