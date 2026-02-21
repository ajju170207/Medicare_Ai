import { useTranslation } from 'react-i18next'
import { Badge, Avatar, message } from 'antd'
import {
  BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  CheckCircleFilled, LogoutOutlined, UserOutlined, HistoryOutlined
} from '@ant-design/icons'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks'
import { SUPPORTED_LANGUAGES } from '../../i18n'
import i18n from '../../i18n'
import type { Language } from '../../types'

export const AppHeader = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar, unreadCount, notifications, markAsRead, markAllRead } = useUIStore()
  const { logout } = useAuth()

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES[0]

  const handleLanguageChange = async (code: Language) => {
    await i18n.changeLanguage(code)
    // Persist to Supabase if logged in (fire and forget)
    if (user) {
      fetch('/api/auth/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      }).catch(() => null)
    }
  }

  const handleLogout = async () => {
    await logout()
    message.success('Signed out successfully')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-brand-border flex items-center px-4 gap-3">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-[8px] focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={sidebarOpen}
        className="flex items-center justify-center w-9 h-9 rounded-[8px] text-brand-textLight
                   hover:bg-brand-surface hover:text-brand-text
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                   transition-colors"
      >
        {sidebarOpen
          ? <MenuFoldOutlined aria-hidden="true" style={{ fontSize: 18 }} />
          : <MenuUnfoldOutlined aria-hidden="true" style={{ fontSize: 18 }} />
        }
      </button>

      {/* Logo + App Name */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-[8px]"
        aria-label="Medicare AI — go to dashboard"
      >
        {/* Logo SVG placeholder — replace with actual SVG */}
        <div
          className="w-8 h-8 rounded-[8px] bg-brand-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-brand-text text-base hidden sm:block">Medicare AI</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-2">

        {/* Language Selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label={`Language: ${currentLang.label}. Click to change.`}
              className="flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-sm text-brand-textLight
                         border border-brand-border bg-white
                         hover:bg-brand-surface hover:text-brand-text
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                         transition-colors"
            >
              <span aria-hidden="true">{currentLang.flag}</span>
              <span className="hidden md:block">{currentLang.nativeLabel}</span>
              <span className="text-brand-muted text-xs" aria-hidden="true">▼</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-[12px] shadow-cardHover border border-brand-border p-1 z-50 animate-fade-in"
              sideOffset={6}
              align="end"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenu.Item
                  key={lang.code}
                  onSelect={() => handleLanguageChange(lang.code as Language)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-brand-text
                             cursor-pointer outline-none
                             hover:bg-brand-surface focus:bg-brand-surface
                             data-[highlighted]:bg-brand-surface"
                >
                  <span aria-hidden="true">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                  <span className="text-brand-muted ml-auto">{lang.label}</span>
                  {i18n.language === lang.code && (
                    <CheckCircleFilled
                      aria-label="Currently selected"
                      style={{ color: 'var(--color-brand-secondary, #00B894)', fontSize: 14 }}
                    />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Notification Bell */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              className="relative flex items-center justify-center w-9 h-9 rounded-[8px] text-brand-textLight
                         hover:bg-brand-surface hover:text-brand-text
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                         transition-colors"
            >
              <BellOutlined aria-hidden="true" style={{ fontSize: 18 }} />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 w-4 h-4 bg-brand-danger rounded-full
                             text-white text-2xs flex items-center justify-center font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-80 bg-white rounded-[12px] shadow-cardHover border border-brand-border z-50 overflow-hidden animate-fade-in"
              sideOffset={6}
              align="end"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                <span className="font-semibold text-brand-text text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div
                className="max-h-72 overflow-y-auto overscroll-contain"
                role="list"
                aria-label="Notifications"
                aria-live="polite"
              >
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-brand-muted text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      role="listitem"
                      className={`px-4 py-3 border-b border-brand-border last:border-0 cursor-pointer
                                  hover:bg-brand-surface transition-colors
                                  ${!n.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <p className="text-sm font-medium text-brand-text">{n.title}</p>
                      <p className="text-xs text-brand-muted mt-0.5">{n.body}</p>
                      <p className="text-2xs text-brand-muted mt-1">
                        {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(n.createdAt))}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label={`User menu for ${user?.fullName ?? 'User'}`}
              className="flex items-center gap-2 px-2 py-1 rounded-[8px]
                         hover:bg-brand-surface
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                         transition-colors"
            >
              <Avatar
                size={32}
                src={user?.avatarUrl}
                aria-hidden="true"
                style={{ backgroundColor: '#0057D9', flexShrink: 0 }}
              >
                {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <span className="text-sm font-medium text-brand-text hidden md:block max-w-[120px] truncate">
                {user?.fullName ?? 'User'}
              </span>
              {user?.phoneVerified && (
                <CheckCircleFilled
                  aria-label="Phone verified"
                  style={{ color: '#00B894', fontSize: 14 }}
                />
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white rounded-[12px] shadow-cardHover border border-brand-border p-1 z-50 animate-fade-in"
              sideOffset={6}
              align="end"
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold text-brand-text truncate">{user?.fullName}</p>
                <p className="text-xs text-brand-muted truncate">{user?.phone}</p>
              </div>

              <DropdownMenu.Separator className="h-px bg-brand-border mx-1 my-1" />

              {[
                { icon: <UserOutlined aria-hidden="true" />, label: 'Profile', to: '/profile' },
                { icon: <HistoryOutlined aria-hidden="true" />, label: t('nav.history'), to: '/history' },
              ].map(({ icon, label, to }) => (
                <DropdownMenu.Item
                  key={to}
                  onSelect={() => navigate(to)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-brand-text
                             cursor-pointer outline-none hover:bg-brand-surface focus:bg-brand-surface
                             data-[highlighted]:bg-brand-surface"
                >
                  {icon}
                  {label}
                </DropdownMenu.Item>
              ))}

              <DropdownMenu.Separator className="h-px bg-brand-border mx-1 my-1" />

              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-brand-danger
                           cursor-pointer outline-none hover:bg-red-50 focus:bg-red-50
                           data-[highlighted]:bg-red-50"
              >
                <LogoutOutlined aria-hidden="true" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
