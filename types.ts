export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  color: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  nextLevelXP: number;
}
