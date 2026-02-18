/// <reference types="vite/client" />
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, TaskComment, Habit, Achievement, Notification, UserProfile } from './types';

// Use current origin if in production, otherwise use localhost:3000
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

export interface VisualPreferences {
  motion: boolean;
  scanlines: boolean;
  chromatic: boolean;
  intensity: number;
  notifications: boolean;
  lowPower: boolean;
}

const DEFAULT_PREFS: VisualPreferences = {
  motion: true,
  scanlines: true,
  chromatic: true,
  intensity: 100,
  notifications: true,
  lowPower: false
};

export interface SquadChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string, name: string, level: number };
}

interface AppState {
  // Auth & Session
  isAuthenticated: boolean;
  user: UserProfile | null;
  visualPrefs: VisualPreferences;
  isInitialSync: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncAt: string | null;

  // Data
  tasks: Task[];
  habits: Habit[];
  achievements: Achievement[];
  notifications: Notification[];
  activeTask: Task | null;
  backendStatus: { status: string; database: string } | null;

  // Core Actions
  setAuth: (user: UserProfile) => void;
  setOnline: (online: boolean) => void;
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;
  syncAll: () => Promise<void>;
  setActiveTask: (task: Task | null) => void;

  // Notification Actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // User Actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateVisualPrefs: (prefs: Partial<VisualPreferences>) => Promise<void>;
  changePassword: (data: any) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (data: any) => Promise<{ success: boolean; message: string }>;
  setup2FA: () => Promise<{ qrCode: string; secret: string }>;
  enable2FA: (token: string) => Promise<{ success: boolean; message: string }>;
  verify2FALogin: (userId: string, token: string) => Promise<{ success: boolean; message: string; user?: any }>;

  // Tactical Actions
  addTask: (data: any) => Promise<void>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (teamId: string, taskId: string, assigneeId: string) => Promise<void>;
  addComment: (teamId: string, taskId: string, content: string, type?: string) => Promise<void>;
  resolveComment: (teamId: string, commentId: string) => Promise<void>;
  getTaskComments: (teamId: string, taskId: string) => Promise<TaskComment[]>;
  getTeamMembers: (teamId: string) => Promise<any[]>;

  // Tactical Chat
  getSquadChat: (teamId: string) => Promise<SquadChatMessage[]>;
  sendSquadMessage: (teamId: string, content: string) => Promise<void>;

  addHabit: (title: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Admin Actions
  updateAchievementDefinition: (id: string, data: any) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      visualPrefs: DEFAULT_PREFS,
      isInitialSync: true,
      isSyncing: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSyncAt: null,
      tasks: [],
      habits: [],
      achievements: [],
      notifications: [],
      activeTask: null,
      backendStatus: null,

      setAuth: (user) => {
        console.log('[Store] Auth established for:', user.email);
        let visualPrefs = DEFAULT_PREFS;
        if (user.preferences) {
          try {
            visualPrefs = { ...DEFAULT_PREFS, ...JSON.parse(user.preferences) };
          } catch (e) { }
        }
        set({ user, visualPrefs, isAuthenticated: true, isInitialSync: false });
      },

      setOnline: (online) => set({ isOnline: online }),

      setActiveTask: (task) => set({ activeTask: task }),

      logout: async () => {
        console.log('[Store] Terminating session...');
        try {
          await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) { }

        set({
          user: null,
          isAuthenticated: false,
          tasks: [],
          habits: [],
          achievements: [],
          notifications: [],
          isInitialSync: true,
          lastSyncAt: null
        });
        localStorage.clear();
        window.location.hash = '#/login';
      },

      syncAll: async () => {
        if (!get().isAuthenticated) return;
        set({ isSyncing: true });

        try {
          console.log('[Store] Synchronizing neural data...');
          const responses = await Promise.allSettled([
            fetch(`${API_BASE}/tasks`, { credentials: 'include' }),
            fetch(`${API_BASE}/habits`, { credentials: 'include' }),
            fetch(`${API_BASE}/user/profile`, { credentials: 'include' }),
            fetch(`${API_BASE}/user/achievements`, { credentials: 'include' }),
            fetch(`${API_BASE}/user/notifications`, { credentials: 'include' })
          ]);

          const [tasksRes, habitsRes, profileRes, achievementsRes, notificationsRes] = responses.map(r =>
            r.status === 'fulfilled' ? r.value : { ok: false, status: 500 } as Response
          );

          if (tasksRes.status === 401 || profileRes.status === 401) {
            console.warn('[Store] Session invalidated by server');
            get().logout();
            return;
          }

          if (profileRes.ok) {
            const profile = await profileRes.json();
            let visualPrefs = get().visualPrefs;
            if (profile.preferences) {
              try {
                visualPrefs = { ...DEFAULT_PREFS, ...JSON.parse(profile.preferences) };
              } catch (e) { }
            }
            set({
              visualPrefs,
              user: { ...profile, name: profile.name || profile.email.split('@')[0] }
            });
          }

          if (tasksRes.ok) set({ tasks: await tasksRes.json() });
          if (habitsRes.ok) {
            const habitsRaw = await habitsRes.json();
            set({
              habits: habitsRaw.map((h: any) => ({
                id: h.id,
                title: h.title,
                completedDates: h.logs?.filter((l: any) => l.completed).map((l: any) => l.date.split('T')[0]) || []
              }))
            });
          }
          if (achievementsRes.ok) set({ achievements: await achievementsRes.json() });
          if (notificationsRes.ok) set({ notifications: await notificationsRes.json() });

          set({ lastSyncAt: new Date().toISOString(), isOnline: true });
          console.log('[Store] Neural synchronization attempt complete');
        } catch (e) {
          console.error('[Store] Sync critical failure:', e);
          set({ isOnline: false });
        } finally {
          set({ isSyncing: false, isInitialSync: false });
        }
      },

      checkStatus: async () => {
        try {
          const res = await fetch(`${API_BASE}/status`);
          if (res.ok) {
            const data = await res.json();
            set({ backendStatus: data });
          } else {
            set({ backendStatus: { status: 'offline', database: 'unknown' } });
          }
        } catch (e) {
          set({ backendStatus: { status: 'offline', database: 'unknown' } });
        }
      },

      markNotificationRead: async (id) => {
        const res = await fetch(`${API_BASE}/user/notifications/${id}/read`, {
          method: 'PATCH',
          credentials: 'include'
        });
        if (res.ok) {
          set(state => ({
            notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
          }));
        }
      },

      markAllNotificationsRead: async () => {
        const res = await fetch(`${API_BASE}/user/notifications/read-all`, {
          method: 'PATCH',
          credentials: 'include'
        });
        if (res.ok) {
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true }))
          }));
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        const res = await fetch(`${API_BASE}/user/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (res.ok) await get().syncAll();
      },

      updateVisualPrefs: async (newPrefs) => {
        const updated = { ...get().visualPrefs, ...newPrefs };
        set({ visualPrefs: updated });

        // Persist to backend
        await fetch(`${API_BASE}/user/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ preferences: JSON.stringify(updated) })
        });
      },

      changePassword: async (data) => {
        const res = await fetch(`${API_BASE}/auth/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          return { success: true, message: 'Password updated successfully. Session re-validated.' };
        } else {
          const err = await res.json();
          return { success: false, message: err.message || 'Password update failed' };
        }
      },

      verifyEmail: async (token) => {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        return { success: res.ok, message: data.message || (res.ok ? 'Email verified successfully' : 'Verification failed') };
      },

      forgotPassword: async (email) => {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        return { success: res.ok, message: data.message };
      },

      resetPassword: async (data) => {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        return { success: res.ok, message: result.message || (res.ok ? 'Password reset successful' : 'Reset failed') };
      },

      setup2FA: async () => {
        const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
          method: 'POST',
          credentials: 'include'
        });
        return await res.json();
      },

      enable2FA: async (token) => {
        const res = await fetch(`${API_BASE}/auth/2fa/enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (res.ok) await get().syncAll();
        return { success: res.ok, message: data.message || '2FA enabled' };
      },

      verify2FALogin: async (userId, token) => {
        const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token })
        });
        const data = await res.json();
        if (res.ok) {
          get().setAuth(data);
          return { success: true, message: 'Login successful', user: data };
        }
        return { success: false, message: data.message || 'Invalid 2FA token' };
      },

      addTask: async (data) => {
        const tempId = 'temp-' + Date.now();
        const newTask: Task = {
          id: tempId,
          title: data.title,
          priority: data.priority,
          status: data.status || 'todo',
          createdAt: new Date().toISOString(),
          commentsCount: 0
        };

        set(state => ({ tasks: [newTask, ...state.tasks] }));

        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          const saved = await res.json();
          set(state => ({
            tasks: state.tasks.map(t => t.id === tempId ? saved : t)
          }));
        } else {
          set(state => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
        }
      },

      updateTask: async (id, data) => {
        const oldTasks = get().tasks;
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t)
        }));

        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          set({ tasks: oldTasks });
        } else if (data.status === 'done' || data.priority) {
          await get().syncAll(); // Refresh to get correct scores/XP
        }
      },

      deleteTask: async (id) => {
        const oldTasks = get().tasks;
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!res.ok) set({ tasks: oldTasks });
      },

      assignTask: async (teamId, taskId, assigneeId) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}/assign`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ assigneeId })
        });
        if (res.ok) await get().syncAll();
      },

      addComment: async (teamId, taskId, content, type = 'standard') => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content, type })
        });
        if (res.ok) await get().syncAll();
      },

      resolveComment: async (teamId, commentId) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/comments/${commentId}/resolve`, {
          method: 'PATCH',
          credentials: 'include'
        });
        if (res.ok) await get().syncAll();
      },

      getTaskComments: async (teamId, taskId) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}/comments`, {
          credentials: 'include'
        });
        if (res.ok) return await res.json();
        return [];
      },

      getTeamMembers: async (teamId) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
          credentials: 'include'
        });
        if (res.ok) return await res.json();
        return [];
      },

      getSquadChat: async (teamId) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/chat`, {
          credentials: 'include'
        });
        if (res.ok) return await res.json();
        return [];
      },

      sendSquadMessage: async (teamId, content) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Transmission failed');
        }
      },

      addHabit: async (title) => {
        const tempId = 'temp-' + Date.now();
        const newHabit: Habit = { id: tempId, title, completedDates: [] };
        set(state => ({ habits: [...state.habits, newHabit] }));

        const res = await fetch(`${API_BASE}/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title })
        });
        if (res.ok) await get().syncAll();
        else set(state => ({ habits: state.habits.filter(h => h.id !== tempId) }));
      },

      toggleHabit: async (id, date) => {
        const oldHabits = get().habits;
        set(state => ({
          habits: state.habits.map(h => {
            if (h.id === id) {
              const exists = h.completedDates.includes(date);
              return {
                ...h,
                completedDates: exists
                  ? h.completedDates.filter(d => d !== date)
                  : [...h.completedDates, date]
              };
            }
            return h;
          })
        }));

        const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ date })
        });
        if (!res.ok) set({ habits: oldHabits });
        else await get().syncAll();
      },

      deleteHabit: async (id) => {
        const oldHabits = get().habits;
        set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
        const res = await fetch(`${API_BASE}/habits/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!res.ok) set({ habits: oldHabits });
      },

      updateAchievementDefinition: async (id, data) => {
        const res = await fetch(`${API_BASE}/admin/achievements/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (res.ok) await get().syncAll();
      }
    }),
    {
      name: 'nexus-core-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        visualPrefs: state.visualPrefs,
        tasks: state.tasks,
        habits: state.habits,
        achievements: state.achievements,
        notifications: state.notifications
      }),
    }
  )
);
