import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { GraduationCap, Shield, UserRound, Users } from 'lucide-react'
import { ROLE_HOME, useAuth } from '../../app/AuthContext'
import { getSchools, getUsersByRole } from '../../services/people'

// The three students the demo script focuses on; the other nine appear in tutor and admin views.
const FEATURED_STUDENTS = ['u-oliver', 'u-mia', 'u-sam']

const GROUPS = [
  { role: 'student', title: 'Students', icon: GraduationCap, blurb: 'The island map, lessons and practice log.' },
  { role: 'parent', title: 'Parent', icon: Users, blurb: "Your children's progress, notes and billing." },
  { role: 'tutor', title: 'Tutors', icon: UserRound, blurb: 'Your students, feedback and exam readiness.' },
  { role: 'admin', title: 'Admin', icon: Shield, blurb: 'Students, content, enrolments and news.' },
]

export default function Login() {
  const { user, role, signIn } = useAuth()
  const navigate = useNavigate()
  const [people, setPeople] = useState(null)

  useEffect(() => {
    Promise.all([...GROUPS.map((g) => getUsersByRole(g.role)), getSchools()]).then(([students, parents, tutors, admins, schools]) => {
      const schoolName = (id) => schools.find((s) => s.id === id)?.name
      setPeople({
        student: students
          .filter((s) => FEATURED_STUDENTS.includes(s.id))
          .map((s) => ({ ...s, detail: s.isAdult ? 'Adult learner, at home' : `${s.yearGroup}, ${schoolName(s.schoolId)}` })),
        parent: parents.map((p) => ({ ...p, detail: 'Parent of Oliver and Mia' })),
        tutor: tutors.map((t) => ({ ...t, detail: t.id === 'u-roc' ? 'Founder and tutor' : 'Piano tutor' })),
        admin: admins.map((a) => ({ ...a, detail: 'Owner, sees everything' })),
      })
    })
  }, [])

  if (user) return <Navigate to={ROLE_HOME[role]} replace />

  function choose(person, asRole) {
    signIn(person.id, asRole)
    navigate(ROLE_HOME[asRole])
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">Who's coming aboard?</h1>
      <p className="mt-4 max-w-2xl text-lg text-deep-soft">
        This is a demo, so there are no passwords. Pick a person to see the platform through their eyes. In the real platform a parent signs in and
        chooses which child is practising.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {GROUPS.map(({ role: groupRole, title, icon: Icon, blurb }) => (
          <section key={groupRole} aria-labelledby={`group-${groupRole}`} className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
            <div className="flex items-start gap-3">
              <Icon aria-hidden className="mt-1 shrink-0 text-lagoon" size={24} />
              <div>
                <h2 id={`group-${groupRole}`} className="text-2xl">
                  {title}
                </h2>
                <p className="text-deep-soft">{blurb}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {people?.[groupRole].map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => choose(person, groupRole)}
                    className="flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-foam active:bg-foam"
                  >
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-deep font-display text-lg text-key">
                      {person.displayName[0]}
                    </span>
                    <span>
                      <span className="block font-bold">{person.displayName}</span>
                      <span className="block text-sm text-deep-soft">{person.detail}</span>
                    </span>
                  </button>
                </li>
              )) ?? <li className="px-3 py-2 text-deep-soft">Loading the crew…</li>}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
