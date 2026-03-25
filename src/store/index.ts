import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile, Notification, MoodLog } from '../types';

// ─── Auth Store ────────────────────────────────────────────────────
interface AuthState {
  user:            User | null;
  profile:         UserProfile | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  setUser:    (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout:     () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      profile:         null,
      isLoading:       false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, profile: null, isAuthenticated: false }),
    }),
    {
      name: 'lumina-auth',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);

// ─── UI Store ──────────────────────────────────────────────────────
interface UIState {
  sidebarOpen:   boolean;
  theme:         'light'; // future: 'dark'
  notifications: Notification[];
  unreadCount:   number;

  toggleSidebar:       () => void;
  setSidebarOpen:      (open: boolean) => void;
  addNotification:     (n: Notification) => void;
  markAllRead:         () => void;
  clearNotifications:  () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen:   false,
  theme:         'light',
  notifications: [],
  unreadCount:   0,

  toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 50),
      unreadCount:   s.unreadCount + (n.isRead ? 0 : 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount:   0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// ─── Health Store ──────────────────────────────────────────────────
interface HealthState {
  moodLogs:     MoodLog[];
  todayMood:    number | null;

  addMoodLog:   (log: MoodLog) => void;
  setTodayMood: (score: number) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      moodLogs:     [],
      todayMood:    null,

      addMoodLog: (log) =>
        set((s) => ({ moodLogs: [log, ...s.moodLogs].slice(0, 90) })),

      setTodayMood: (score) => set({ todayMood: score }),
    }),
    { name: 'lumina-health' }
  )
);
