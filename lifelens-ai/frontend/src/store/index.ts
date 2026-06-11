import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppStore } from "../lib/types"

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null, isAuthenticated: false, isLoading: false,
      currentView: "daily", sidebarOpen: true,
      setUser:          (user)  => set({ user }),
      setAuthenticated: (val)   => set({ isAuthenticated: val }),
      setLoading:       (val)   => set({ isLoading: val }),
      setCurrentView:   (view)  => set({ currentView: view }),
      toggleSidebar:    ()      => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      logout: () => {
        if (typeof window!=="undefined") localStorage.removeItem("ll_token")
        set({ user:null, isAuthenticated:false })
        window.location.href="/auth/login"
      },
    }),
    { name:"lifelens-store", partialize: s => ({ user:s.user, isAuthenticated:s.isAuthenticated, currentView:s.currentView }) }
  )
)
