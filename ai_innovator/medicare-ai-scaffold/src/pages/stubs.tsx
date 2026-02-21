// ─── Stub pages — ready to be implemented ─────────────────────────────────────
// Each is a named export matching what router/index.tsx imports

export const SymptomCheckerPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-brand-text mb-2">Symptom Checker</h1>
    <p className="text-brand-textLight">Full implementation per PRD — symptom multi-select, ML prediction, recommendations accordion.</p>
  </div>
)

export const ImageCheckerPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-brand-text mb-2">Image-Based Symptom Checker</h1>
    <p className="text-brand-textLight">Full implementation per PRD — category selector, dropzone, crop, Flask inference, result card.</p>
  </div>
)

export const EmergencyPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-red-600 mb-2">🚨 Emergency Services</h1>
    <p className="text-brand-textLight">Full implementation per PRD — geolocation, national helplines, regional contacts, map view.</p>
  </div>
)

export const DiseaseLibraryPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-brand-text mb-2">Disease Library</h1>
    <p className="text-brand-textLight">Full implementation per PRD — search, filters, card grid, detail drawer, seeded from ML CSVs.</p>
  </div>
)

export const HospitalFinderPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-brand-text mb-2">Hospital Finder</h1>
    <p className="text-brand-textLight">Full implementation per PRD — Google Places API, filters, map, hospital detail drawer.</p>
  </div>
)

export const HistoryPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-brand-text mb-2">My History</h1>
    <p className="text-brand-textLight">Full implementation — timeline grouped by date, expandable entries, delete with confirmation.</p>
  </div>
)

export const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
    <p className="text-6xl font-bold text-brand-border mb-4">404</p>
    <h1 className="text-2xl font-bold text-brand-text mb-2">Page Not Found</h1>
    <p className="text-brand-muted mb-6">The page you're looking for doesn't exist.</p>
    <a href="/dashboard" className="text-brand-primary hover:underline focus-visible:ring-2 focus-visible:ring-brand-primary rounded">
      ← Go to Dashboard
    </a>
  </div>
)
