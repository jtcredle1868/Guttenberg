import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TitlesPage } from './pages/TitlesPage';
import { NewTitlePage } from './pages/NewTitlePage';
import { TitleDetailPage } from './pages/TitleDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FinancePage } from './pages/FinancePage';
import { MarketingPage } from './pages/MarketingPage';
import { CatalogPage } from './pages/CatalogPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading Guttenberg...</p>
      </div>
    </div>
  );
  const hasToken = !!localStorage.getItem('access_token');
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
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
        <ToastContainer />
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
);

export default App;
