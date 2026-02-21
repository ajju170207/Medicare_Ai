import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Tag, Skeleton } from 'antd'
import {
  MedicineBoxOutlined, CameraOutlined, AlertOutlined,
  BookOutlined, AimOutlined, HistoryOutlined, BulbOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { historyService } from '../services'
import type { HistoryEntry } from '../types'

// ─── Feature cards config ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <MedicineBoxOutlined style={{ fontSize: 32 }} />,
    name: 'Symptom Checker',
    description: 'Describe your symptoms and get an AI-powered assessment',
    to: '/symptom-checker',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <CameraOutlined style={{ fontSize: 32 }} />,
    name: 'Image Checker',
    description: 'Upload a photo of a skin or eye condition for analysis',
    to: '/image-checker',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: <AlertOutlined style={{ fontSize: 32 }} />,
    name: 'Emergency Services',
    description: 'Instant access to emergency contacts for your region',
    to: '/emergency',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: <BookOutlined style={{ fontSize: 32 }} />,
    name: 'Disease Library',
    description: 'Explore conditions, symptoms, precautions, and treatments',
    to: '/disease-library',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: <AimOutlined style={{ fontSize: 32 }} />,
    name: 'Hospital Finder',
    description: 'Find hospitals and specialists near your location',
    to: '/hospital-finder',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: <HistoryOutlined style={{ fontSize: 32 }} />,
    name: 'My History',
    description: 'View your past symptom checks and image analyses',
    to: '/history',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

const NATIONAL_EMERGENCY = [
  { number: '112', label: 'National Emergency' },
  { number: '102', label: 'Ambulance' },
  { number: '108', label: 'EMRI' },
]

// ─── Greeting helper ──────────────────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    historyService.getAll()
      .then((res) => setHistory(res.data.data.slice(0, 3)))
      .catch(() => null)
      .finally(() => setHistoryLoading(false))
  }, [])

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date())

  return (
    <div className="space-y-6 animate-fade-in [@media(prefers-reduced-motion:reduce)]:animate-none">

      {/* Welcome Banner */}
      <section
        className="relative overflow-hidden rounded-card bg-brand-primary p-6 md:p-8 text-white"
        aria-label="Welcome banner"
      >
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-balance">
            {getGreeting()}, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/80 mt-2 text-sm md:text-base max-w-md">
            How are you feeling today? Use the tools below to check your symptoms or find help.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
        <div className="absolute bottom-0 right-12 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" aria-hidden="true" />
      </section>

      {/* Quick Access Grid */}
      <section aria-labelledby="quick-access-heading">
        <h2 id="quick-access-heading" className="text-lg font-semibold text-brand-text mb-4">
          {t('dashboard.quickAccess')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group block bg-white rounded-card border border-brand-border shadow-card no-underline
                         hover:shadow-cardHover hover:-translate-y-0.5
                         transition-[transform,box-shadow]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                         touch-manipulation
                         [@media(prefers-reduced-motion:reduce)]:hover:translate-y-0"
              aria-label={`${feature.name} — ${feature.description}`}
            >
              <article className="p-5">
                <div className={`w-14 h-14 rounded-[12px] ${feature.bg} ${feature.color} flex items-center justify-center mb-4`} aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-brand-text mb-1 text-balance">{feature.name}</h3>
                <p className="text-sm text-brand-textLight line-clamp-2 min-w-0">{feature.description}</p>
                <span className="mt-3 inline-block text-sm text-brand-primary font-medium group-hover:underline" aria-hidden="true">
                  Open →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom row: Recent Activity + Emergency + Health Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity */}
        <section className="lg:col-span-2" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-lg font-semibold text-brand-text mb-4">
            {t('dashboard.recentActivity')}
          </h2>

          {historyLoading ? (
            <div className="space-y-3">
              {[0,1,2].map((i) => <Skeleton key={i} active paragraph={{ rows: 1 }} className="bg-white rounded-card p-4 border border-brand-border" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-card border border-brand-border p-8 text-center">
              <BulbOutlined aria-hidden="true" style={{ fontSize: 32, color: '#8A94A6' }} />
              <p className="text-brand-muted mt-2 text-sm">{t('dashboard.noHistory')}</p>
              <Link to="/symptom-checker" className="mt-3 inline-block text-sm text-brand-primary hover:underline">
                Start a Symptom Check →
              </Link>
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Recent symptom checks">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  role="listitem"
                  className="bg-white rounded-card border border-brand-border p-4 flex items-start gap-3"
                >
                  <Tag color={entry.type === 'symptom_check' ? 'blue' : 'purple'} className="flex-shrink-0 mt-0.5">
                    {entry.type === 'symptom_check' ? 'Symptom' : 'Image'}
                  </Tag>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-text text-sm truncate">
                      {'disease' in entry.result ? entry.result.disease : entry.result.condition}
                    </p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))}
                    </p>
                  </div>
                  <Link to="/history" className="text-xs text-brand-primary hover:underline flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Emergency Strip + Health Tip */}
        <div className="space-y-4">
          {/* Emergency */}
          <section aria-labelledby="emergency-heading">
            <h2 id="emergency-heading" className="text-lg font-semibold text-brand-text mb-4">
              Emergency
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-card p-4 space-y-2">
              {NATIONAL_EMERGENCY.map((e) => (
                <a
                  key={e.number}
                  href={`tel:${e.number}`}
                  aria-label={`Call ${e.label}, number ${e.number}`}
                  className="flex items-center justify-between bg-white border border-red-200 rounded-[8px] px-3 py-3
                             text-red-600 no-underline font-semibold
                             hover:bg-red-50 hover:border-red-300
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                             touch-manipulation min-h-[48px]
                             transition-colors"
                >
                  <span className="text-xl font-bold tabular-nums">{e.number}</span>
                  <span className="text-xs text-brand-muted font-normal text-right">{e.label}</span>
                </a>
              ))}
              <Link
                to="/emergency"
                className="block text-center text-sm text-red-600 hover:underline mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
              >
                View All Emergency Services →
              </Link>
            </div>
          </section>

          {/* Health Tip */}
          <section aria-labelledby="tip-heading">
            <div className="bg-white border border-brand-border rounded-card p-4">
              <h2 id="tip-heading" className="flex items-center gap-2 text-sm font-semibold text-brand-text mb-2">
                <BulbOutlined aria-hidden="true" style={{ color: '#DD6B20' }} />
                {t('dashboard.healthTip')}
              </h2>
              <p className="text-sm text-brand-textLight">
                Drink at least 8 glasses of water daily. Staying hydrated helps maintain healthy blood pressure and kidney function.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
