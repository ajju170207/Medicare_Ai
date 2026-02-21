import { apiClient, flaskClient } from './apiClient'
import type {
  LoginPayload, RegisterPayload, OTPPayload, AuthTokens, User,
  SymptomCheckPayload, SymptomCheckResult,
  ImageCategory, ImageCheckResult,
  Disease, HospitalFilters, Hospital,
  EmergencyContact, HistoryEntry, Notification,
  ApiResponse,
} from '../types'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<{ phone: string }>>('/auth/register', payload),

  verifyOtp: (payload: OTPPayload) =>
    apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/verify-otp', payload),

  resendOtp: (phone: string) =>
    apiClient.post<ApiResponse<{ sent: boolean }>>('/auth/resend-otp', { phone }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),
}

// ─── Symptom Checker ─────────────────────────────────────────────────────────
export const symptomService = {
  getSymptomsList: () =>
    apiClient.get<ApiResponse<string[]>>('/symptoms/list'),

  predict: (payload: SymptomCheckPayload) =>
    apiClient.post<ApiResponse<SymptomCheckResult>>('/symptom-checker/predict', payload),

  // Direct Flask call (proxied through Node.js — never call Flask directly from client)
  predictDirect: (payload: SymptomCheckPayload) =>
    flaskClient.post<SymptomCheckResult>('/predict', payload),
}

// ─── Image Checker ───────────────────────────────────────────────────────────
export const imageService = {
  uploadImage: (file: File, category: ImageCategory) => {
    const form = new FormData()
    form.append('image', file)
    form.append('category', category)
    return apiClient.post<ApiResponse<{ imageUrl: string; s3Key: string }>>(
      '/image-checker/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  analyzeImage: (imageUrl: string, category: ImageCategory) =>
    apiClient.post<ApiResponse<ImageCheckResult>>('/image-checker/analyze', { imageUrl, category }),
}

// ─── Disease Library ─────────────────────────────────────────────────────────
export const diseaseService = {
  getAll: (params?: { q?: string; severity?: string; specialist?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ diseases: Disease[]; total: number }>>('/diseases', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Disease>>(`/diseases/${id}`),
}

// ─── Emergency ───────────────────────────────────────────────────────────────
export const emergencyService = {
  getContacts: (state: string, district?: string, type?: string) =>
    apiClient.get<ApiResponse<EmergencyContact[]>>('/emergency/contacts', {
      params: { state, district, type },
    }),

  getNationalHelplines: () =>
    apiClient.get<ApiResponse<{ number: string; label: string; description: string }[]>>(
      '/emergency/national'
    ),
}

// ─── Hospital Finder ─────────────────────────────────────────────────────────
export const hospitalService = {
  search: (lat: number, lng: number, filters: Partial<HospitalFilters>) =>
    apiClient.get<ApiResponse<Hospital[]>>('/hospitals', {
      params: { lat, lng, ...filters },
    }),

  getDetails: (placeId: string) =>
    apiClient.get<ApiResponse<Hospital>>(`/hospitals/${placeId}`),
}

// ─── History ─────────────────────────────────────────────────────────────────
export const historyService = {
  getAll: () =>
    apiClient.get<ApiResponse<HistoryEntry[]>>('/history'),

  save: (entry: Omit<HistoryEntry, 'id' | 'userId' | 'createdAt'>) =>
    apiClient.post<ApiResponse<HistoryEntry>>('/history', entry),

  delete: (id: string) =>
    apiClient.delete(`/history/${id}`),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationService = {
  getAll: () =>
    apiClient.get<ApiResponse<Notification[]>>('/notifications'),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all'),
}
