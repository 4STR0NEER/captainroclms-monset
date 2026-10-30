import { Link } from 'react-router'
import { Camera } from 'lucide-react'
import { PageHeader, PlaceholderTag } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { getUsersByRole } from '../../services/people'

const GRADUATES = [
  { name: 'Matthew Thomson', note: '2021 National Jazz Awards finalist for piano. Masters at the Sydney Conservatorium, then the New England Conservatory.' },
  { name: 'Ed Wells', note: 'Recording artist in London. Started with Roc at age 7.' },
  { name: 'Thomas Odell', note: 'Won a scholarship to the Sydney Conservatorium.' },
  { name: 'Charles Wilkinson', note: 'Bass player, studied at the Sydney Conservatorium.' },
  { name: 'Max Wilson', note: 'Learning with Roc since age 3.' },
]

const ROC_BIO =
  'Founder of JazzRoc. Studied jazz and jazz piano at the NSW Conservatorium and has taught hundreds of students since the mid 1980s.'

export default function About() {
  const { data: tutors } = useAsync(() => getUsersByRole('tutor'))

  return (
    <>
      <PageHeader title="Meet Captain Roc">
        <p>Roc Koren has been teaching piano on Sydney's Northern Beaches since the mid 1980s. His students know him as Captain Roc.</p>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 md:grid-cols-[1.3fr_1fr]">
        <div className="max-w-prose space-y-5 text-lg">
          <p>
            Roc studied jazz and jazz piano at the NSW Conservatorium in the early 1980s and has taught hundreds of students since. He prepares
            students for the ABRSM Jazz Piano and Jazz Ensemble exams, set by the Associated Board of the Royal Schools of Music in London.
          </p>
          <h2 className="pt-4 text-3xl">Contemporary and fun first</h2>
          <p>
            Students learn chord notation early, improvise from the start, and play pop, jazz and TV tunes alongside classical pieces for a rounded
            musical education. Exams are there for students who want a challenge, but they are always optional.
          </p>
          <p>
            Every lesson is a stop on Captain Roc's archipelago, from Melody Island to Exam Island, so children always know where they are and
            where they are heading next.
          </p>
        </div>
        <figure className="self-start border-l-0 md:pt-16">
          <blockquote className="font-display text-3xl leading-snug sm:text-4xl">“Music teaching is entertainment as well as education.”</blockquote>
          <figcaption className="mt-4 text-deep-soft">Captain Roc</figcaption>
        </figure>
      </section>

      <div className="key-rule" aria-hidden />

      <section aria-labelledby="team-title" className="bg-key">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="team-title" className="text-3xl sm:text-4xl">
            The crew
          </h2>
          <ul className="mt-10 grid gap-10 sm:grid-cols-3">
            {tutors?.map((t) => (
              <li key={t.id}>
                <div className="grid aspect-square w-40 place-items-center rounded-full border-2 border-dashed border-deep/30 bg-foam text-deep-soft">
                  <span className="flex flex-col items-center gap-1 text-sm">
                    <Camera aria-hidden size={22} />
                    Photo to come
                  </span>
                </div>
                <h3 className="mt-5 text-2xl">{t.id === 'u-roc' ? 'Captain Roc' : t.displayName}</h3>
                <p className="text-deep-soft">{t.id === 'u-roc' ? 'Founder and piano tutor' : 'Piano tutor'}</p>
                <p className="mt-2">{t.id === 'u-roc' ? ROC_BIO : t.bio}</p>
                {t.placeholder && (
                  <p className="mt-2">
                    <PlaceholderTag>Placeholder bio</PlaceholderTag>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="grads-title" className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="grads-title" className="text-3xl sm:text-4xl">
          Where the voyage can lead
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-deep-soft">Some of the students who started at Module One with Roc.</p>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {GRADUATES.map((g) => (
            <li key={g.name} className="grid gap-1 py-6 sm:grid-cols-[16rem_1fr] sm:gap-8">
              <h3 className="text-2xl">{g.name}</h3>
              <p className="text-lg text-deep-soft">{g.note}</p>
            </li>
          ))}
        </ul>
        <Link to="/news/matthew-thomson-national-jazz-awards" className="mt-8 inline-block font-bold text-lagoon">
          Read Matthew's story
        </Link>
      </section>
    </>
  )
}
