# Medicare AI — React Frontend Scaffold

Production-ready React + TypeScript + Tailwind + Ant Design + Bits UI scaffold.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + custom design tokens |
| UI Components | Ant Design 5 + Bits UI (Radix primitives) |
| State | Zustand (auth + UI stores) |
| Server State | TanStack Query v5 |
| Routing | React Router v6 |
| i18n | i18next (7 Indian languages) |
| HTTP | Axios + JWT interceptors + refresh rotation |
| PWA | Vite PWA Plugin |
| Build | Vite 5 |

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx       ✅ Full implementation
│   │   ├── AppSidebar.tsx      ✅ Full implementation (desktop + mobile drawer)
│   │   └── AppLayout.tsx       ✅ Full implementation
│   ├── auth/                   → OTPInput (inside AuthPage.tsx)
│   ├── dashboard/              → FeatureCard, EmergencyStrip (inside DashboardPage.tsx)
│   ├── shared/                 → Reusable: EmptyState, SeverityBadge, ConfirmModal
│   └── ui/                     → Primitive wrappers
├── pages/
│   ├── AuthPage.tsx            ✅ Full — SignIn, SignUp, OTP flow
│   ├── DashboardPage.tsx       ✅ Full — welcome banner, grid, history, emergency strip
│   ├── SymptomCheckerPage.tsx  🔧 Stub — implement per PRD Section 5.3
│   ├── ImageCheckerPage.tsx    🔧 Stub — implement per PRD Section 5.4
│   ├── EmergencyPage.tsx       🔧 Stub — implement per PRD Section 5.5
│   ├── DiseaseLibraryPage.tsx  🔧 Stub — implement per PRD Section 5.6
│   ├── HospitalFinderPage.tsx  🔧 Stub — implement per PRD Section 5.7
│   └── HistoryPage.tsx         🔧 Stub — implement per PRD Section 5.8
├── store/
│   ├── authStore.ts            ✅ Full — JWT, user, refresh, persist
│   └── uiStore.ts              ✅ Full — sidebar, notifications, geolocation
├── services/
│   ├── apiClient.ts            ✅ Full — Axios + JWT interceptors + refresh rotation
│   └── index.ts                ✅ Full — all service functions
├── hooks/
│   └── index.ts                ✅ useAuth, useGeolocation, useDebounce, useMediaQuery
├── router/
│   └── index.tsx               ✅ Full — protected routes, public-only routes, lazy loading
├── types/
│   └── index.ts                ✅ Full — all TypeScript interfaces
├── i18n/
│   ├── index.ts                ✅ Full — i18next setup, 7 languages
│   └── locales/
│       ├── en.json             ✅ Complete English translations
│       └── hi.json             ✅ Hindi translations (extend remaining 5)
└── styles/
    └── globals.css             ✅ Full — fonts, resets, reduced-motion, AntD overrides
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Start Node.js backend (separate terminal)
cd ../server && npm run dev

# 5. Start Flask ML server (separate terminal)
cd ../flask_server && python app.py
```

## Key Decisions

### JWT Storage
Tokens stored in `sessionStorage` via Zustand persist middleware.
- Clears on browser tab close (more secure than localStorage)
- httpOnly cookies are preferred for production — switch `apiClient.ts` to cookie-based if backend supports it

### API Proxy
All Google Maps Places API calls go through Node.js `/api/hospitals` and `/api/geocode`.
Only the Maps JS rendering key is exposed to the frontend via `VITE_GOOGLE_MAPS_KEY`.

### Routing
- `/` → redirects to `/auth`
- `/auth` → public-only (redirects logged-in users to `/dashboard`)
- `/dashboard` and all feature routes → protected (redirects guests to `/auth`)
- `isHydrated` flag prevents flash of wrong route during Zustand rehydration

### Accessibility
- Every icon-only button has `aria-label`
- All `<a>` tags used for navigation, `<button>` for actions
- `prefers-reduced-motion` respected on all animations
- `aria-live` regions on all async status updates
- Skip link at top of AppHeader and AuthPage

### Performance
- All pages lazy-loaded via `React.lazy` + `Suspense`
- Manual chunk splitting: vendor / antd / radix / query / i18n
- PWA service worker caches disease library + emergency data for offline use

## Adding a New Language

1. Create `src/i18n/locales/{code}.json` (copy `en.json`, translate all values)
2. Import in `src/i18n/index.ts` and add to `resources`
3. Add to `SUPPORTED_LANGUAGES` array in `src/i18n/index.ts`

## Implementing Stub Pages

Each stub page (`SymptomCheckerPage`, etc.) exports a placeholder component.
Replace with full implementation by editing the corresponding `.tsx` file directly.
The router imports are already wired — no routing changes needed.
