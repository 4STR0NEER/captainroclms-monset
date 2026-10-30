import { Navigate, Outlet } from 'react-router'
import { ROLE_HOME, useAuth } from './AuthContext'

// Wraps a group of routes: signed-out visitors go to /login, other roles go to their own home.
export default function RequireRole({ role }) {
  const { user, role: current, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (current !== role) return <Navigate to={ROLE_HOME[current]} replace />
  return <Outlet />
}
