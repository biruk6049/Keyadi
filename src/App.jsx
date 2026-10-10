import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { isNativePlatform } from './lib/platform'
import AppLoadingScreen from './components/AppLoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import LegalPages from './pages/LegalPages'
import ErrorBoundary from './components/ErrorBoundary'

/**
 * Intelligent Root Route:
 * - Application Version (Capacitor Android/iOS, installed PWA, standalone):
 *   If signed in, opens the dashboard directly; if unauthenticated, redirects to login.
 * - Web Version:
 *   If the user is already authenticated, routes straight to the dashboard.
 *   If the visitor is new, displays the landing page.
 */
function RootRoute() {
  const { user, loading } = useAuth()
  const isApp = isNativePlatform()

  if (loading) {
    return <AppLoadingScreen />
  }

  // Application Version: Requires authentication
  if (isApp) {
    return user ? <Dashboard /> : <Navigate to="/login" replace />
  }

  // Web Version: Signed-in users go straight to the app
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Public web visitors
  return <Landing />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<LegalPages />} />
        <Route path="/terms" element={<LegalPages />} />
        <Route path="/cookies" element={<LegalPages />} />
        <Route path="/refund" element={<LegalPages />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Wildcard catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}