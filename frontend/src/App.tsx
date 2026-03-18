import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';

/* Eager-loaded pages (fast-path) */
import { LoginPage } from './pages/LoginPage';

/* Lazy-loaded pages (code-split) */
const DashboardPage    = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TitlesPage       = lazy(() => import('./pages/TitlesPage').then(m => ({ default: m.TitlesPage })));
const NewTitlePage     = lazy(() => import('./pages/NewTitlePage').then(m => ({ default: m.NewTitlePage })));
const TitleDetailPage  = lazy(() => import('./pages/TitleDetailPage').then(m => ({ default: m.TitleDetailPage })));
const AnalyticsPage    = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FinancePage      = lazy(() => import('./pages/FinancePage').then(m => ({ default: m.FinancePage })));
const MarketingPage    = lazy(() => import('./pages/MarketingPage').then(m => ({ default: m.MarketingPage })));
const CatalogPage      = lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const SettingsPage     = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

/* ── Branded loading spinner ── */
const PageLoader = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{ background: 'linear-gradient(160deg, #050d1a 0%, #0a1628 60%, #0f2040 100%)' }}
  >
    {/* G logomark */}
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl animate-pulse-gold"
      style={{
        background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)',
        color: '#0a1628',
        fontFamily: '"Playfair Display", Georgia, serif',
        boxShadow: '0 0 24px rgba(212,175,55,0.40), 0 4px 16px rgba(5,13,26,0.50)',
      }}
    >
      G
    </div>
    {/* Spinner ring */}
    <div
      className="w-8 h-8 rounded-full border-2 border-t-transparent"
      style={{
        borderColor: 'rgba(212,175,55,0.25)',
        borderTopColor: '#d4af37',
        animation: 'spin 0.9s linear infinite',
      }}
    />
    <p
      className="text-xs font-semibold tracking-widest uppercase"
      style={{ color: 'rgba(212,175,55,0.55)' }}
    >
      Loading
    </p>
  </div>
);

/* ── Route guard ── */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  const hasToken = !!localStorage.getItem('auth_token');
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

/* ── App ── */
const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected — Publishing */}
            <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/titles"       element={<ProtectedRoute><TitlesPage /></ProtectedRoute>} />
            <Route path="/titles/new"   element={<ProtectedRoute><NewTitlePage /></ProtectedRoute>} />
            <Route path="/titles/:id"   element={<ProtectedRoute><TitleDetailPage /></ProtectedRoute>} />

            {/* Protected — Business */}
            <Route path="/analytics"    element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/finance"      element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />

            {/* Protected — Marketing */}
            <Route path="/marketing"    element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />

            {/* Protected — Platform */}
            <Route path="/catalog"      element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
);

export default App;
