import { createBrowserRouter } from 'react-router'
import PublicLayout from './PublicLayout'
import PortalLayout from './PortalLayout'
import RequireRole from './RequireRole'
import Login from '../features/shared/Login'
import NotFound from '../features/shared/NotFound'
import ComingSoon from '../features/shared/ComingSoon'
import Home from '../features/public/Home'
import About from '../features/public/About'
import Courses from '../features/public/Courses'
import ExamIsland from '../features/public/ExamIsland'
import { NewsList, NewsPost } from '../features/public/News'
import Contact from '../features/public/Contact'
import Privacy from '../features/public/Privacy'
import Dashboard from '../features/student/Dashboard'
import IslandDetail from '../features/student/IslandDetail'
import LessonPlayer from '../features/student/LessonPlayer'
import PracticeLog from '../features/student/PracticeLog'
import Songbook from '../features/student/Songbook'
import Badges from '../features/student/Badges'
import ParentOverview from '../features/parent/Overview'
import ChildDetail from '../features/parent/ChildDetail'
import Billing from '../features/parent/Billing'
import Profiles from '../features/parent/Profiles'
import MyStudents from '../features/tutor/MyStudents'
import StudentDetail from '../features/tutor/StudentDetail'

// Pages not built yet render <ComingSoon>; each phase swaps a stub for the real page.
const soon = (title, phase) => <ComingSoon title={title} phase={phase} />

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/courses', element: <Courses /> },
      { path: '/exam-island', element: <ExamIsland /> },
      { path: '/news', element: <NewsList /> },
      { path: '/news/:slug', element: <NewsPost /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy', element: <Privacy /> },
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
          { path: '/app', element: <Dashboard /> },
          { path: '/app/island/:slug', element: <IslandDetail /> },
          { path: '/app/lesson/:id', element: <LessonPlayer /> },
          { path: '/app/practice', element: <PracticeLog /> },
          { path: '/app/songbook', element: <Songbook /> },
          { path: '/app/badges', element: <Badges /> },
        ],
      },
      {
        element: <RequireRole role="parent" />,
        children: [
          { path: '/parent', element: <ParentOverview /> },
          { path: '/parent/child/:id', element: <ChildDetail /> },
          { path: '/parent/billing', element: <Billing /> },
          { path: '/parent/profiles', element: <Profiles /> },
        ],
      },
      {
        element: <RequireRole role="tutor" />,
        children: [
          { path: '/tutor', element: <MyStudents /> },
          { path: '/tutor/student/:id', element: <StudentDetail /> },
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
