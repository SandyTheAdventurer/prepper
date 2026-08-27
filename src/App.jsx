import { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LogOut, BookOpen, WifiOff } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api, { onBackendStatusChange, isBackendOffline } from './lib/api';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Hook to subscribe to backend offline status
function useBackendOffline() {
  return useSyncExternalStore(
    onBackendStatusChange,
    isBackendOffline
  );
}

// Full-screen overlay when backend is unreachable
const BackendOfflineScreen = ({ children }) => {
  const offline = useBackendOffline();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!offline) return;
    const interval = setInterval(async () => {
      try {
        await api.get('/auth/profile/');
      } catch (e) {
        // will flip the flag back via interceptor if it succeeds
      }
      setRetryCount(c => c + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [offline]);

  return (
    <>
      {children}
      {offline && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '24px',
        }}>
          <WifiOff size={64} color="#ef4444" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', margin: 0, textAlign: 'center' }}>
            BACKEND OFFLINE
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', margin: 0 }}>
            CONTACT SANDEEP
          </p>
          <div style={{
            marginTop: '16px',
            padding: '8px 20px',
            borderRadius: '999px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
          }}>
            Retrying automatically…
          </div>
        </div>
      )}
    </>
  );
};

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/profile/')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login/', credentials);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Layout Component — KEEP EXACTLY AS IS
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), #818cf8)',
            padding: '8px', 
            borderRadius: '8px',
            display: 'flex'
          }}>
            <BookOpen size={24} color="white" />
          </div>
          <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>prepper</h2>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.is_admin && <Link to="/admin">Admin Panel</Link>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.name}</span>
                <button className="secondary" onClick={handleLogout} style={{ padding: '8px', borderRadius: '50%' }}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
};

// Protected Route Component — KEEP EXACTLY AS IS
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.is_admin) return <Navigate to="/dashboard" />;

  return children;
};

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TestEnvironment from './pages/TestEnvironment';
import ManageQuestions from './pages/ManageQuestions';
import TestResult from './pages/TestResult';
import TestAnalytics from './pages/TestAnalytics';
import StudentAnalytics from './pages/StudentAnalytics';

import { ToastProvider } from './components/Toast';

const TITLES = {
  '/login': 'Login',
  '/dashboard': 'Dashboard',
  '/admin': 'Admin Panel',
  '/test': 'Test',
};

function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/test/') && !pathname.includes('/admin')) {
      document.title = 'Prepper — Test Environment';
    } else if (pathname.startsWith('/result/')) {
      document.title = 'Prepper — Test Result';
    } else if (pathname.startsWith('/admin/test/') && pathname.includes('/questions')) {
      document.title = 'Prepper — Manage Questions';
    } else if (pathname.startsWith('/admin/test/') && pathname.includes('/analytics')) {
      document.title = 'Prepper — Test Analytics';
    } else if (pathname.startsWith('/admin/student/')) {
      document.title = 'Prepper — Student Analytics';
    } else {
      const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path));
      document.title = title ? `Prepper — ${title[1]}` : 'Prepper';
    }
  }, [pathname]);
}

function PageTitle() {
  usePageTitle();
  return null;
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BackendOfflineScreen>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <PageTitle />
              <ErrorBoundary>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/result/:testId" element={
                      <ProtectedRoute>
                        <TestResult />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/test/:testId/questions" element={
                      <ProtectedRoute requireAdmin={true}>
                        <ManageQuestions />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/test/:testId/analytics" element={
                      <ProtectedRoute requireAdmin={true}>
                        <TestAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/student/:username/analytics" element={
                      <ProtectedRoute requireAdmin={true}>
                        <StudentAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Route>
                  {/* TestEnvironment does not use Layout */}
                  <Route path="/test/:testId" element={
                    <ProtectedRoute>
                      <TestEnvironment />
                    </ProtectedRoute>
                  } />
                </Routes>
              </ErrorBoundary>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </BackendOfflineScreen>
    </QueryClientProvider>
  );
}

export default App;
