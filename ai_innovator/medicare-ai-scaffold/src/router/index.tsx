import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from '../store/authStore'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthPage } from '../pages/AuthPage'

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const DashboardPage     = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const SymptomChecker    = lazy(() => import('../pages/SymptomCheckerPage').then((m) => ({ default: m.SymptomCheckerPage })))
const ImageChecker      = lazy(() => import('../pages/ImageCheckerPage').then((m) => ({ default: m.ImageCheckerPage })))
const EmergencyPage     = lazy(() => import('../pages/EmergencyPage').then((m) => ({ default: m.EmergencyPage })))
const DiseaseLibrary    = lazy(() => import('../pages/DiseaseLibraryPage').then((m) => ({ default: m.DiseaseLibraryPage })))
const HospitalFinder    = lazy(() => import('../pages/HospitalFinderPage').then((m) => ({ default: m.HospitalFinderPage })))
const HistoryPage       = lazy(() => import('../pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const NotFoundPage      = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

// ─── Page loading fallback ────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-64" aria-label="Loading page…" aria-live="polite">
    <Spin size="large" />
  </div>
)

// ─── Protected route guard ────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const { isAuthenticated, isHydrated } = useAuthStore()

  // Wait for Zustand to rehydrate from sessionStorage before deciding
  if (!isHydrated) return <PageLoader />

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/auth" replace />
}

// ─── Public route guard (redirect to dashboard if already logged in) ──────────
const PublicOnlyRoute = () => {
  const { isAuthenticated, isHydrated } = useAuthStore()
  if (!isHydrated) return <PageLoader />
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/auth" replace />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
    ],
  },

  // Protected routes — all wrapped in AppLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/symptom-checker',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SymptomChecker />
              </Suspense>
            ),
          },
          {
            path: '/image-checker',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ImageChecker />
              </Suspense>
            ),
          },
          {
            path: '/emergency',
            element: (
              <Suspense fallback={<PageLoader />}>
                <EmergencyPage />
              </Suspense>
            ),
          },
          {
            path: '/disease-library',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DiseaseLibrary />
              </Suspense>
            ),
          },
          {
            path: '/hospital-finder',
            element: (
              <Suspense fallback={<PageLoader />}>
                <HospitalFinder />
              </Suspense>
            ),
          },
          {
            path: '/history',
            element: (
              <Suspense fallback={<PageLoader />}>
                <HistoryPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
