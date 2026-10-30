import { TriangleAlert } from 'lucide-react'
import { PageHeader } from '../../components/ui'

// Draft structure only. Every section needs review by a privacy professional before launch.
const SECTIONS = [
  {
    title: 'Who we are',
    body: ['JazzRoc is a piano school run by Roc Koren on the Northern Beaches of Sydney. This policy explains how we handle personal information on our learning platform.'],
  },
  {
    title: 'Accounts belong to parents',
    body: [
      'A parent or guardian creates the family account and adds a profile for each child. Children do not create their own accounts and do not need an email address.',
      'Adult learners create their own account.',
    ],
  },
  {
    title: 'What we collect',
    list: [
      'About the parent: name, email, phone number and billing details (handled by our payment provider, not stored by us).',
      "About each child: first name, school year, which school they learn at, their tutor, lesson progress and practice logs. That's all.",
      'We do not collect photos, surnames, dates of birth or location data for children.',
      'Notes written by tutors about a student’s progress.',
    ],
  },
  {
    title: 'Parent consent',
    body: [
      "We ask for a parent's consent when a child profile is created, and parents can withdraw it at any time by deleting the profile.",
      '[To confirm: consent wording and record keeping.]',
    ],
  },
  {
    title: 'How we use it',
    list: [
      'To show lessons, track progress and unlock new modules.',
      'To let tutors and parents see how a student is going.',
      'To send account and billing emails to parents. We never market to children.',
    ],
  },
  {
    title: 'Videos',
    body: [
      'Lesson videos play inside the platform. Where we use YouTube, we use privacy-enhanced embeds and do not send children to YouTube itself.',
      '[To confirm: final video hosting.]',
    ],
  },
  {
    title: 'Where your information is stored',
    body: ['[To confirm: hosting provider and region. Intended: Australian data region.]'],
  },
  {
    title: 'Who we share it with',
    body: ['Only the services we need to run the platform, such as our payment provider and hosting provider. We never sell personal information.', '[To confirm: list of providers.]'],
  },
  {
    title: 'Seeing, correcting or deleting information',
    body: [
      'Parents can see and edit their family’s information in the parent dashboard. To ask for a copy of your information, or for it to be deleted, email captainroc@jazzroc.com. We will respond as quickly as we can.',
      '[To confirm: response time.]',
    ],
  },
  {
    title: "Children's Online Privacy Code",
    body: [
      "Australia's Children's Online Privacy Code is due by 10 December 2026. We will update this policy to meet it.",
      '[To confirm against the final Code.]',
    ],
  },
  {
    title: 'Contact',
    body: ['Questions or complaints about privacy: captainroc@jazzroc.com or 0408 220 780.'],
  },
]

export default function Privacy() {
  return (
    <>
      <PageHeader title="Privacy policy" />
      <div className="mx-auto max-w-3xl px-4 pb-20">
        <p role="note" className="flex gap-3 rounded-2xl border-2 border-dashed border-buoy bg-key p-5">
          <TriangleAlert aria-hidden className="mt-0.5 shrink-0 text-buoy" size={22} />
          <span>
            <strong>Draft, to be reviewed.</strong> This is a placeholder structure for a children's service, written for the demo. It is not legal
            advice and must be reviewed before launch.
          </span>
        </p>
        <div className="mt-10 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-2xl sm:text-3xl">{s.title}</h2>
              {s.body?.map((b) => (
                <p key={b} className={`mt-3 text-lg ${b.startsWith('[') ? 'text-deep-soft italic' : ''}`}>
                  {b}
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-lg marker:text-lagoon">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
