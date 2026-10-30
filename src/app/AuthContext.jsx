// Demo auth: no passwords, just "who am I and which role am I using".
// Supabase Auth replaces this later; components keep calling useAuth().
import { createContext, useContext, useEffect, useState } from 'react'
import { getUser } from '../services/people'

const SESSION_KEY = 'jazzroc-demo-session'
const AuthContext = createContext(null)

export const ROLE_HOME = { student: '/app', parent: '/parent', tutor: '/tutor', admin: '/admin' }

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession) // { userId, role, viaParentId? }
  const [user, setUser] = useState(null)
  // Derived, not stored: we're loading whenever the session points at a user we haven't fetched yet
  const loading = Boolean(session) && user?.id !== session.userId

  useEffect(() => {
    if (session) getUser(session.userId).then((u) => (u ? setUser(u) : signOut()))
    else setUser(null)
  }, [session])

  // viaParentId: a parent handing the tablet to their child, so the child view can hand it back
  function signIn(userId, role, viaParentId = null) {
    const next = { userId, role, viaParentId }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  const value = { user: loading ? null : user, role: session?.role ?? null, viaParentId: session?.viaParentId ?? null, loading, signIn, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
