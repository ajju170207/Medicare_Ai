import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import { NavLink, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { CheckCircleFilled } from '@ant-design/icons'
import {
  HomeOutlined, MedicineBoxOutlined, CameraOutlined,
  AlertOutlined, BookOutlined, AimOutlined,
  HistoryOutlined, SettingOutlined, BulbOutlined,
  CloseOutlined
} from '@ant-design/icons'
import type { ReactNode } from 'react'

interface NavItem {
  icon: ReactNode
  labelKey: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: <HomeOutlined />,         labelKey: 'nav.home',            to: '/dashboard' },
  { icon: <MedicineBoxOutlined />,  labelKey: 'nav.symptomChecker',  to: '/symptom-checker' },
  { icon: <CameraOutlined />,       labelKey: 'nav.imageChecker',    to: '/image-checker' },
  { icon: <AlertOutlined />,        labelKey: 'nav.emergency',       to: '/emergency' },
  { icon: <BookOutlined />,         labelKey: 'nav.diseaseLibrary',  to: '/disease-library' },
  { icon: <AimOutlined />,          labelKey: 'nav.hospitalFinder',  to: '/hospital-finder' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { icon: <BulbOutlined />,     labelKey: 'nav.whatsNew',  to: '/whats-new' },
  { icon: <HistoryOutlined />,  labelKey: 'nav.history',   to: '/history' },
  { icon: <SettingOutlined />,  labelKey: 'nav.settings',  to: '/settings' },
]

// ─── Shared nav item (used in both mobile + desktop) ─────────────────────────
const SidebarNavItem = ({
  item, collapsed, onClick
}: { item: NavItem; collapsed: boolean; onClick?: () => void }) => {
  const { t } = useTranslation()
  const label = t(item.labelKey)

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium no-underline w-full',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
      'touch-manipulation',
      isActive
        ? 'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary pl-[10px]'
        : 'text-brand-textLight hover:bg-brand-surface hover:text-brand-text border-l-2 border-transparent',
    ].join(' ')

  if (collapsed) {
    return (
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <NavLink
            to={item.to}
            className={linkClasses}
            onClick={onClick}
            aria-label={label}
          >
            <span aria-hidden="true" className="text-lg flex-shrink-0">{item.icon}</span>
          </NavLink>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            className="bg-brand-text text-white text-xs px-2.5 py-1.5 rounded-[6px] z-50"
            sideOffset={8}
          >
            {label}
            <Tooltip.Arrow className="fill-brand-text" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <NavLink to={item.to} className={linkClasses} onClick={onClick}>
      <span aria-hidden="true" className="text-lg flex-shrink-0">{item.icon}</span>
      <span className="truncate min-w-0">{label}</span>
    </NavLink>
  )
}

// ─── Sidebar Content (shared between desktop + mobile drawer) ─────────────────
const SidebarContent = ({
  collapsed = false,
  onNavClick,
}: {
  collapsed?: boolean
  onNavClick?: () => void
}) => {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  return (
    <nav className="flex flex-col h-full" aria-label="Main navigation">
      {/* Main nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-brand-border" />

      {/* Bottom items */}
      <div className="px-3 py-3 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </div>

      {/* User card at bottom */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 p-3 rounded-[10px] bg-brand-surface border border-brand-border">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              aria-hidden="true"
            >
              {user.fullName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brand-text truncate">{user.fullName}</p>
              <p className="text-xs text-brand-muted truncate">{user.phone}</p>
            </div>
            {user.phoneVerified && (
              <CheckCircleFilled
                aria-label="Phone verified"
                style={{ color: '#00B894', fontSize: 14, flexShrink: 0 }}
              />
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export const DesktopSidebar = () => {
  const { sidebarOpen, sidebarCollapsed } = useUIStore()
  const width = sidebarCollapsed ? 'w-16' : 'w-64'

  if (!sidebarOpen) return null

  return (
    <Tooltip.Provider>
      <aside
        className={`
          fixed left-0 top-16 bottom-0 ${width} bg-white border-r border-brand-border
          shadow-sidebar overflow-hidden transition-[width] duration-200
          hidden lg:block z-40
          [@media(prefers-reduced-motion:reduce)]:transition-none
        `}
        aria-label="Application sidebar"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>
    </Tooltip.Provider>
  )
}

// ─── Mobile Sidebar Drawer ────────────────────────────────────────────────────
export const MobileSidebarDrawer = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <Tooltip.Provider>
      <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay
            className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in
                       [@media(prefers-reduced-motion:reduce)]:animate-none"
          />

          {/* Drawer panel */}
          <Dialog.Content
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden
                       shadow-cardHover overscroll-contain
                       animate-slide-in-right
                       [@media(prefers-reduced-motion:reduce)]:animate-none
                       focus:outline-none"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-brand-border">
              <span className="font-bold text-brand-text">Medicare AI</span>
              <Dialog.Close asChild>
                <button
                  aria-label="Close navigation menu"
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] text-brand-muted
                             hover:bg-brand-surface hover:text-brand-text
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <CloseOutlined aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <SidebarContent onNavClick={() => setSidebarOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Tooltip.Provider>
  )
}
