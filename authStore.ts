import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    xp: number;
    level: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setAuth: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'nexus-auth',
        }
    )
);
