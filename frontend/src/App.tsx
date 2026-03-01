import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';

// Lazy-loaded pages for better error isolation
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TitlesPage = lazy(() => import('./pages/TitlesPage').then(m => ({ default: m.TitlesPage })));
const NewTitlePage = lazy(() => import('./pages/NewTitlePage').then(m => ({ default: m.NewTitlePage })));
const TitleDetailPage = lazy(() => import('./pages/TitleDetailPage').then(m => ({ default: m.TitleDetailPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FinancePage = lazy(() => import('./pages/FinancePage').then(m => ({ default: m.FinancePage })));
const MarketingPage = lazy(() => import('./pages/MarketingPage').then(m => ({ default: m.MarketingPage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  const hasToken = !!localStorage.getItem('access_token');
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/titles" element={<ProtectedRoute><TitlesPage /></ProtectedRoute>} />
            <Route path="/titles/new" element={<ProtectedRoute><NewTitlePage /></ProtectedRoute>} />
            <Route path="/titles/:id" element={<ProtectedRoute><TitleDetailPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
);

export default App;
