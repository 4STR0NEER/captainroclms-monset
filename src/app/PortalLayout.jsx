import { NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { LogOut, RotateCcw, Users } from 'lucide-react'
import Logo from '../components/Logo'
import { ROLE_HOME, useAuth } from './AuthContext'
import { resetDemo } from '../services/db'

const NAV = {
  student: [
    { to: '/app', label: 'Island map', end: true, alsoActive: ['/app/island', '/app/lesson'] },
    { to: '/app/practice', label: 'Practice log' },
    { to: '/app/songbook', label: 'Songbook' },
    { to: '/app/badges', label: 'Badges' },
  ],
  parent: [
    { to: '/parent', label: 'Overview', end: true, alsoActive: ['/parent/child'] },
    { to: '/parent/billing', label: 'Billing' },
    { to: '/parent/profiles', label: 'Child profiles' },
  ],
  tutor: [{ to: '/tutor', label: 'My students', end: true }],
  admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/content', label: 'Content' },
    { to: '/admin/exam-interest', label: 'Exam interest' },
    { to: '/admin/news', label: 'News' },
  ],
}

const navClass = (active) =>
  `shrink-0 rounded-full px-4 py-2 font-bold no-underline transition-colors ${active ? 'bg-deep text-key' : 'text-deep hover:bg-deep/5'}`

export default function PortalLayout() {
  const { user, role, viaParentId, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleReset() {
    if (!window.confirm('Reset all demo data? Progress, practice logs and edits made in this browser will be cleared.')) return
    resetDemo()
    window.location.reload()
  }

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-key focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-foam/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo to={role ? ROLE_HOME[role] : '/'} />
          {user && (
            <div className="flex items-center gap-2">
              {viaParentId && (
                <button
                  type="button"
                  onClick={() => {
                    signIn(viaParentId, 'parent')
                    navigate('/parent')
                  }}
                  className="btn btn-quiet px-3"
                >
                  <Users aria-hidden size={20} />
                  <span className="sr-only sm:not-sr-only">Parent view</span>
                </button>
              )}
              <span className="hidden text-right leading-tight sm:block">
                <span className="block font-bold">{user.displayName}</span>
                <span className="block text-sm capitalize text-deep-soft">{role}</span>
              </span>
              <button type="button" onClick={handleSignOut} className="btn btn-quiet px-3">
                <LogOut aria-hidden size={20} />
                <span className="sr-only sm:not-sr-only">Sign out</span>
              </button>
            </div>
          )}
        </div>
        {role && (
          <nav aria-label="Portal" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
            {NAV[role].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => navClass(isActive || n.alsoActive?.some((p) => pathname.startsWith(p)))}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-deep-soft">
          <p>Demo build. Everything you do is saved in this browser only.</p>
          <button type="button" onClick={handleReset} className="btn btn-quiet min-h-11 text-sm">
            <RotateCcw aria-hidden size={16} />
            Reset demo data
          </button>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
