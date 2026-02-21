import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { DesktopSidebar, MobileSidebarDrawer } from './AppSidebar'
import { useUIStore } from '../../store/uiStore'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { notificationService } from '../../services'

export const AppLayout = () => {
  const { sidebarCollapsed, sidebarOpen, setNotifications } = useUIStore()
  const { user } = useAuthStore()

  // Fetch notifications on mount
  useEffect(() => {
    if (!user) return
    notificationService.getAll()
      .then((res) => setNotifications(res.data.data))
      .catch(() => null)
  }, [user, setNotifications])

  // Desktop content offset based on sidebar state
  const contentPadding = sidebarOpen
    ? sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
    : 'lg:pl-0'

  return (
    <div className="min-h-screen bg-brand-surface">
      <AppHeader />
      <DesktopSidebar />
      <MobileSidebarDrawer />

      <main
        id="main-content"
        className={`pt-16 min-h-screen transition-[padding-left] duration-200
                    ${contentPadding}
                    [@media(prefers-reduced-motion:reduce)]:transition-none`}
        tabIndex={-1} // Allows skip link focus
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
