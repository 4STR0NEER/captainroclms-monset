import { createBrowserRouter } from 'react-router'
import PublicLayout from './PublicLayout'
import PortalLayout from './PortalLayout'
import RequireRole from './RequireRole'
import Login from '../features/shared/Login'
import NotFound from '../features/shared/NotFound'
import ComingSoon from '../features/shared/ComingSoon'

// Pages not built yet render <ComingSoon>; each phase swaps a stub for the real page.
const soon = (title, phase) => <ComingSoon title={title} phase={phase} />

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: soon('Home', 2) },
      { path: '/about', element: soon('About Captain Roc', 2) },
      { path: '/courses', element: soon('Courses and pricing', 2) },
      { path: '/exam-island', element: soon('Exam Island', 2) },
      { path: '/news', element: soon('News', 2) },
      { path: '/news/:slug', element: soon('News post', 2) },
      { path: '/contact', element: soon('Contact', 2) },
      { path: '/privacy', element: soon('Privacy policy', 2) },
      { path: '/login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <PortalLayout />,
    children: [
      {
        element: <RequireRole role="student" />,
        children: [
          { path: '/app', element: soon('Your island map', 3) },
          { path: '/app/island/:slug', element: soon('Island', 3) },
          { path: '/app/lesson/:id', element: soon('Lesson', 4) },
          { path: '/app/practice', element: soon('Practice log', 4) },
          { path: '/app/songbook', element: soon('Songbook', 4) },
          { path: '/app/badges', element: soon('Badges', 4) },
        ],
      },
      {
        element: <RequireRole role="parent" />,
        children: [
          { path: '/parent', element: soon('Family overview', 5) },
          { path: '/parent/child/:id', element: soon('Child progress', 5) },
          { path: '/parent/billing', element: soon('Billing', 5) },
          { path: '/parent/profiles', element: soon('Child profiles', 5) },
        ],
      },
      {
        element: <RequireRole role="tutor" />,
        children: [
          { path: '/tutor', element: soon('My students', 6) },
          { path: '/tutor/student/:id', element: soon('Student', 6) },
        ],
      },
      {
        element: <RequireRole role="admin" />,
        children: [
          { path: '/admin', element: soon('Overview', 7) },
          { path: '/admin/students', element: soon('Students and enrolments', 7) },
          { path: '/admin/content', element: soon('Content library', 7) },
          { path: '/admin/exam-interest', element: soon('Exam interest', 7) },
          { path: '/admin/news', element: soon('News editor', 7) },
        ],
      },
    ],
  },
])
