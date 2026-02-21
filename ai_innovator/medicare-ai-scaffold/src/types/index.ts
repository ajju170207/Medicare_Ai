// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  fullName: string
  phone: string
  email?: string
  phoneVerified: boolean
  preferredLanguage: Language
  avatarUrl?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  phone: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  phone: string
  email?: string
  password: string
}

export interface OTPPayload {
  phone: string
  otp: string
}

// ─── Language ────────────────────────────────────────────────────────────────
export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu'

export interface LanguageOption {
  code: Language
  label: string
  nativeLabel: string
  flag: string
}

// ─── Symptom Checker ─────────────────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type SymptomDuration =
  | 'less_than_1_day'
  | '1_3_days'
  | '3_7_days'
  | '1_4_weeks'
  | 'over_1_month'

export interface SymptomCheckPayload {
  symptoms: string[]
  age?: number
  gender?: Gender
  duration?: SymptomDuration
}

export type Severity = 'mild' | 'moderate' | 'severe'

export interface SymptomCheckResult {
  disease: string
  confidence: number
  severity: Severity
  description: string
  precautions: string[]
  medications: string[]
  diet: string[]
  workout: string[]
  specialistType: string
}

// ─── Image Checker ───────────────────────────────────────────────────────────
export type ImageCategory = 'skin' | 'eye'

export interface ImageCheckResult {
  condition: string
  confidence: number
  urgency: 'low' | 'medium' | 'high'
  description: string
  advice: string[]
  specialistType: string
  imageUrl: string
}

// ─── Disease Library ─────────────────────────────────────────────────────────
export interface Disease {
  id: string
  name: string
  description: string
  symptoms: string[]
  severityScore: number
  severity: Severity
  precautions: string[]
  medications: string[]
  dietRecommendations: string[]
  workoutRecommendations: string[]
  specialistType: string
  icdCode?: string
}

// ─── Emergency ───────────────────────────────────────────────────────────────
export type EmergencyType = 'hospital' | 'ambulance' | 'helpline' | 'clinic'

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  type: EmergencyType
  state: string
  district: string
  latitude?: number
  longitude?: number
  available24h: boolean
  address?: string
}

export interface NationalHelpline {
  number: string
  label: string
  description: string
}

// ─── Hospital Finder ─────────────────────────────────────────────────────────
export type HospitalType = 'all' | 'government' | 'private' | 'clinic' | 'diagnostic'
export type MedicalSpecialty =
  | 'all' | 'general' | 'cardiology' | 'orthopedics'
  | 'neurology' | 'dermatology' | 'pediatrics'
  | 'gynecology' | 'oncology' | 'emergency'

export interface Hospital {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number
  totalRatings?: number
  isOpen?: boolean
  phone?: string
  types: string[]
  photos?: string[]
  distance?: number
}

export interface HospitalFilters {
  radius: number
  type: HospitalType
  specialty: MedicalSpecialty
  openNow: boolean
  query: string
}

// ─── User History ────────────────────────────────────────────────────────────
export type HistoryType = 'symptom_check' | 'image_check'

export interface HistoryEntry {
  id: string
  userId: string
  type: HistoryType
  inputData: SymptomCheckPayload | { imageUrl: string; category: ImageCategory }
  result: SymptomCheckResult | ImageCheckResult
  createdAt: string
}

// ─── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

// ─── Geolocation ─────────────────────────────────────────────────────────────
export interface Coordinates {
  lat: number
  lng: number
}

export interface UserLocation extends Coordinates {
  state: string
  district: string
  city: string
  displayName: string
}

// ─── API Response Wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

// ─── UI State ────────────────────────────────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
