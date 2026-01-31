import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_BASE = 'http://localhost:3000/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: number;
  nextLevelXP: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'done' | 'backlog';
  dueDate?: string;
  description?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[];
}

interface AppState {
  // Auth & Session
  isAuthenticated: boolean;
  user: UserProfile | null;
  isInitialSync: boolean;
  isSyncing: boolean;

  // Data
  tasks: Task[];
  habits: Habit[];

  // Core Actions
  setAuth: (user: UserProfile) => void;
  logout: () => Promise<void>;
  syncAll: () => Promise<void>;

  // Tactical Actions
  addTask: (data: any) => Promise<void>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isInitialSync: true,
      isSyncing: false,
      tasks: [],
      habits: [],

      setAuth: (user) => {
        console.log('[Store] Auth established for:', user.email);
        set({ user, isAuthenticated: true, isInitialSync: false });
      },

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
          const [tasksRes, habitsRes, profileRes] = await Promise.all([
            fetch(`${API_BASE}/tasks`, { credentials: 'include' }),
            fetch(`${API_BASE}/habits`, { credentials: 'include' }),
            fetch(`${API_BASE}/user/profile`, { credentials: 'include' })
          ]);

          if (tasksRes.status === 401 || profileRes.status === 401) {
            console.warn('[Store] Session invalidated by server');
            get().logout();
            return;
          }

          if (tasksRes.ok && habitsRes.ok && profileRes.ok) {
            const tasks = await tasksRes.json();
            const habitsRaw = await habitsRes.json();
            const profile = await profileRes.json();

            const habits = habitsRaw.map((h: any) => ({
              id: h.id,
              title: h.title,
              streak: h.streak || 0,
              completedDates: h.logs?.filter((l: any) => l.completed).map((l: any) => l.date.split('T')[0]) || []
            }));

            console.log('[Store] Sync complete. Profile recognized:', profile.name);
            set({
              tasks,
              habits,
              user: {
                ...profile,
                name: profile.name || profile.email.split('@')[0]
              },
              isInitialSync: false
            });
          }
        } catch (e) {
          console.error('[Store] Sync failed:', e);
        } finally {
          set({ isSyncing: false });
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
        user: state.user
      }), // Only persist session info, not all tasks
    }
  )
);
