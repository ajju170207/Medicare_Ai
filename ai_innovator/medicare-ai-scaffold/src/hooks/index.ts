import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { authService } from '../services'
import type { UserLocation } from '../types'

// ─── useAuth ─────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const { user, isAuthenticated, accessToken, logout, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    try { await authService.logout() } catch (_) { /* ignore */ }
    logout()
    navigate('/auth', { replace: true })
  }, [logout, navigate])

  return { user, isAuthenticated, accessToken, logout: handleLogout, setUser }
}

// ─── useGeolocation ───────────────────────────────────────────────────────────
export const useGeolocation = () => {
  const { userLocation, locationStatus, locationError,
    setUserLocation, setLocationStatus, setLocationError } = useUIStore()

  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocationStatus('detecting')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        try {
          // Reverse geocode via our backend proxy (protects API key)
          const res = await fetch(
            `/api/geocode/reverse?lat=${lat}&lng=${lng}`
          )
          const data = await res.json()
          const location: UserLocation = {
            lat,
            lng,
            state: data.state || '',
            district: data.district || '',
            city: data.city || '',
            displayName: data.displayName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
          }
          setUserLocation(location)
        } catch {
          // Still set coordinates even if reverse geocode fails
          setUserLocation({ lat, lng, state: '', district: '', city: '', displayName: 'Your Location' })
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please enable location access in your browser settings.',
          2: 'Unable to determine your location. Please try again.',
          3: 'Location request timed out. Please try again.',
        }
        setLocationError(messages[err.code] || 'Location detection failed')
      },
      { timeout: 10_000, maximumAge: 300_000 } // cache for 5 min
    )
  }, [setUserLocation, setLocationStatus, setLocationError])

  return { userLocation, locationStatus, locationError, detect }
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = import('react').then(({ useState }) =>
    useState<T>(value)
  ) as unknown as [T, (v: T) => void]

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ─── useMediaQuery ────────────────────────────────────────────────────────────
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = import('react').then(({ useState }) =>
    useState<boolean>(() => window.matchMedia(query).matches)
  ) as unknown as [boolean, (v: boolean) => void]

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

// ─── useKeyDown ───────────────────────────────────────────────────────────────
export const useKeyDown = (key: string, handler: () => void) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => { if (e.key === key) handler() }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [key, handler])
}

// ─── useClickOutside ──────────────────────────────────────────────────────────
export const useClickOutside = <T extends HTMLElement>(
  handler: () => void
) => {
  const ref = useRef<T>(null)
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [handler])
  return ref
}
