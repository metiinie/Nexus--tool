export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    bio?: string;
    preferences?: string;
    xp: number;
    level: number;
    nextLevelXP: number;
    isVerified?: boolean;
    twoFactorEnabled?: boolean;
    role?: 'admin' | 'operator';
    notificationPrefs?: string;
    quietHours?: string;
}

export interface Task {
    id: string;
    title: string;
    priority: Priority;
    status: Status;
    dueDate?: string;
    description?: string;
    createdAt: string;
    order?: number;
    assignee?: { id: string, name: string, email: string };
    user?: { id: string, name: string, email: string };
    team?: { id: string, name: string };
    commentsCount?: number;
    comments?: any[];
}

export interface TaskComment {
    id: string;
    content: string;
    type: 'standard' | 'update' | 'question' | 'block';
    resolved: boolean;
    createdAt: string;
    user: { id: string, name: string, email: string };
    resolvedBy?: { id: string, name: string };
}

export interface Habit {
    id: string;
    title: string;
    completedDates: string[];
}

export interface Achievement {
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    isUnlocked: boolean;
    progress: number;
    target: number;
    unlockedAt?: string;
    unlockedReason?: string;
    version: number;
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: string;
}
