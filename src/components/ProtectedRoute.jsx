import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLoadingScreen from './AppLoadingScreen'

/**
 * Route guard that mandates user authentication.
 * Unauthenticated users are redirected to /login with their attempted URL preserved.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AppLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
