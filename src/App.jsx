import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { isNativePlatform } from './lib/platform'
import AppLoadingScreen from './components/AppLoadingScreen'
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
 *   Bypasses the marketing landing page completely and opens the interactive
 *   map dashboard directly, giving users an immediate premium app experience.
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

  // Application Version: Never show the landing page
  if (isApp) {
    return <Dashboard />
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ErrorBoundary>
  )
}