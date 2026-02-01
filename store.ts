import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_BASE = 'http://localhost:3000/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  preferences?: string; // Stringified JSON
  xp: number;
  level: number;
  nextLevelXP: number;
}

export interface VisualPreferences {
  motion: boolean;
  scanlines: boolean;
  chromatic: boolean;
  intensity: number;
  notifications: boolean;
}

const DEFAULT_PREFS: VisualPreferences = {
  motion: true,
  scanlines: true,
  chromatic: true,
  intensity: 100,
  notifications: true
};

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'done' | 'backlog';
  dueDate?: string;
  description?: string;
  createdAt: string;
  assignee?: { id: string, name: string, email: string };
  user?: { id: string, name: string, email: string };
  team?: { id: string, name: string };
  commentsCount?: number;
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string, name: string, email: string };
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'ops' | 'neural' | 'status';
  isUnlocked: boolean;
  progress?: number;
  target?: number;
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

interface AppState {
  // Auth & Session
  isAuthenticated: boolean;
  user: UserProfile | null;
  visualPrefs: VisualPreferences;
  isInitialSync: boolean;
  isSyncing: boolean;

  // Data
  tasks: Task[];
  habits: Habit[];
  achievements: Achievement[];
  notifications: Notification[];
  activeTask: Task | null;

  // Core Actions
  setAuth: (user: UserProfile) => void;
  logout: () => Promise<void>;
  syncAll: () => Promise<void>;
  setActiveTask: (task: Task | null) => void;

  // Notification Actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // User Actions
  updateProfile: (data: { name?: string; bio?: string }) => Promise<void>;
  updateVisualPrefs: (prefs: Partial<VisualPreferences>) => Promise<void>;
  changePassword: (data: any) => Promise<{ success: boolean; message: string }>;

  // Tactical Actions
  addTask: (data: any) => Promise<void>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (teamId: string, taskId: string, assigneeId: string) => Promise<void>;
  addComment: (teamId: string, taskId: string, content: string) => Promise<void>;
  getTaskComments: (teamId: string, taskId: string) => Promise<TaskComment[]>;
  getTeamMembers: (teamId: string) => Promise<any[]>;
  addHabit: (title: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      visualPrefs: DEFAULT_PREFS,
      isInitialSync: true,
      isSyncing: false,
      tasks: [],
      habits: [],
      achievements: [],
      notifications: [],
      activeTask: null,

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
          isInitialSync: true
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
                streak: h.streak || 0,
                completedDates: h.logs?.filter((l: any) => l.completed).map((l: any) => l.date.split('T')[0]) || []
              }))
            });
          }
          if (achievementsRes.ok) set({ achievements: await achievementsRes.json() });
          if (notificationsRes.ok) set({ notifications: await notificationsRes.json() });

          console.log('[Store] Neural synchronization attempt complete');
        } catch (e) {
          console.error('[Store] Sync critical failure:', e);
        } finally {
          set({ isSyncing: false, isInitialSync: false });
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

      updateProfile: async (data) => {
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
        const res = await fetch(`${API_BASE}/user/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          return { success: true, message: 'Password updated successfully' };
        } else {
          const err = await res.json();
          return { success: false, message: err.message || 'Password update failed' };
        }
      },

      addTask: async (data) => {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (res.ok) await get().syncAll();
      },

      updateTask: async (id, data) => {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (res.ok) await get().syncAll();
      },

      deleteTask: async (id) => {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        await get().syncAll();
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

      addComment: async (teamId, taskId, content) => {
        const res = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content })
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

      addHabit: async (title) => {
        const res = await fetch(`${API_BASE}/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title })
        });
        if (res.ok) await get().syncAll();
      },

      toggleHabit: async (id, date) => {
        const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ date })
        });
        if (res.ok) await get().syncAll();
      },

      deleteHabit: async (id) => {
        await fetch(`${API_BASE}/habits/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        await get().syncAll();
      }
    }),
    {
      name: 'nexus-core-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        visualPrefs: state.visualPrefs
      }),
    }
  )
);
