import { create } from 'zustand'
import type { UserLocation, Notification } from '../types'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllRead: () => void
  addNotification: (notification: Notification) => void

  // Geolocation
  userLocation: UserLocation | null
  locationStatus: 'idle' | 'detecting' | 'success' | 'error'
  locationError: string | null
  setUserLocation: (location: UserLocation) => void
  setLocationStatus: (status: UIState['locationStatus']) => void
  setLocationError: (error: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Notifications
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),
  markAsRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length }
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.read ? 0 : 1),
    })),

  // Geolocation
  userLocation: null,
  locationStatus: 'idle',
  locationError: null,
  setUserLocation: (location) => set({ userLocation: location, locationStatus: 'success' }),
  setLocationStatus: (status) => set({ locationStatus: status }),
  setLocationError: (error) => set({ locationError: error, locationStatus: 'error' }),
}))
