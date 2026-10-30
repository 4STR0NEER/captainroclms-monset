import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import Lenis from 'lenis'
import { Menu, X } from 'lucide-react'
import Logo from '../components/Logo'

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/exam-island', label: 'Exam Island' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
]

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-2 font-bold no-underline transition-colors hover:bg-deep/5 ${isActive ? 'text-lagoon' : 'text-deep'}`

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Smooth scrolling on marketing pages only, and never for reduced-motion users
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-key focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-foam/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/login" className="btn btn-primary ml-2">
              Sign in
            </Link>
          </nav>
          <button
            type="button"
            className="btn btn-quiet px-3 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="flex flex-col gap-1 border-t border-line px-4 pb-4 pt-2 md:hidden">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/login" className="btn btn-primary mt-2">
              Sign in
            </Link>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="on-deep bg-deep text-foam">
        <div className="key-rule bg-foam" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-foam/80">Contemporary piano lessons on Sydney's Northern Beaches since the mid 1980s.</p>
          </div>
          <div>
            <h2 className="text-lg text-key">Where Roc teaches</h2>
            <ul className="mt-3 space-y-2 text-foam/85">
              <li>Newport Public School, Stuart St, Newport NSW 2106</li>
              <li>St Lukes Grammar School, 210 Headland Rd, Dee Why NSW 2099</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg text-key">Get in touch</h2>
            <ul className="mt-3 space-y-2 text-foam/85">
              <li>
                <a className="text-key" href="mailto:captainroc@jazzroc.com">captainroc@jazzroc.com</a>
              </li>
              <li>
                <a className="text-key" href="tel:+61408220780">0408 220 780</a>
              </li>
              <li>
                <Link className="text-key" to="/privacy">Privacy policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
