import React from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { User } from './types';
import { Dashboard } from './pages/Dashboard';
import { StoreAdmin } from './pages/StoreAdmin';
import { StoreFront } from './pages/StoreFront';
import { PlatformAdmin } from './pages/PlatformAdmin';
import { UserProfile } from './pages/UserProfile';
import { Marketplace } from './pages/Marketplace';
import { Auth } from './pages/Auth';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Verification } from './pages/Verification';
import { AuthCallback } from './pages/AuthCallback';
import { canAccessAdminDashboard, getPostLoginRoute } from './src/lib/adminAccess';
import './src/lib/firebase';

// --- Landing ---
import Landing from './pages/Landing';

export const isFullyVerified = (user: User | null) => {
  return user && user.isVerified !== false && user.kycStatus === 'APPROVED' && user.paymentVerified === true;
};

// --- Route Wrappers ---
const DashboardWrapper: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (!isFullyVerified(user)) return <Navigate to="/verify" replace />;

  return <Dashboard user={user} onLogout={onLogout} onNavigate={navigate} />;
};

const StoreAdminWrapper: React.FC<{ user: User | null }> = ({ user }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (!isFullyVerified(user)) return <Navigate to="/verify" replace />;
  if (!storeId) return <Navigate to="/dashboard" replace />;
  return <StoreAdmin storeId={storeId} onNavigate={navigate} />;
};

const StoreFrontWrapper: React.FC = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  if (!storeId) return <Navigate to="/shop" replace />;
  return <StoreFront storeId={storeId} onNavigate={navigate} />;
};

const PlatformAdminWrapper: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (!isFullyVerified(user)) return <Navigate to="/verify" replace />;
  if (!canAccessAdminDashboard(user)) return <Navigate to="/dashboard" replace />;
  return <PlatformAdmin user={user} onNavigate={navigate} onLogout={onLogout} />;
};

const UserProfileWrapper: React.FC<{ user: User | null }> = ({ user: _user }) => {
  const navigate = useNavigate();
  if (!_user) return <Navigate to="/login" replace />;
  if (!isFullyVerified(_user)) return <Navigate to="/verify" replace />;
  return <UserProfile onNavigate={navigate} />;
};

const MarketplaceWrapper: React.FC = () => {
  return <Marketplace />;
};

const VerificationWrapper: React.FC<{ user: User | null }> = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <Verification />;
};

// --- Main App ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center">
        <p className="text-sm font-bold tracking-wider uppercase text-white/70">Loading session...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={!isFullyVerified(user) ? "/verify" : getPostLoginRoute(user)} replace /> : <Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Protected Routes */}
      <Route path="/verify" element={<VerificationWrapper user={user} />} />
      <Route path="/dashboard" element={<DashboardWrapper user={user} onLogout={logout} />} />
      <Route path="/admin" element={<PlatformAdminWrapper user={user} onLogout={logout} />} />
      <Route path="/profile" element={<UserProfileWrapper user={user} />} />
      <Route path="/store/:storeId/admin/*" element={<StoreAdminWrapper user={user} />} />

      {/* Public Shop Routes */}
      <Route path="/shop" element={<MarketplaceWrapper />} />
      <Route path="/store/:storeId/*" element={<StoreFrontWrapper />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <HashRouter>
                  <AppRoutes />
                </HashRouter>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
