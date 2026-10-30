import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { animate, createScope, stagger } from 'animejs'
import { Award, MapPin, Music, Sailboat, Users } from 'lucide-react'
import CausticsBackground from '../../components/kokonut/CausticsBackground'
import { Mark, MarkerText } from '../../components/kokonut/MarkerText'
import QuoteDeck from '../../components/vengeance/QuoteDeck'
import { PirateShipIcon } from '../../components/PirateShip'
import { useAsync } from '../../utils/useAsync'
import { getTestimonials } from '../../services/site'
import { C_MAJOR, playNote } from '../../utils/piano'

const HEADLINE = 'Learn piano with Captain Roc'

const PATHS = [
  {
    icon: Sailboat,
    title: 'I am a beginner',
    body: 'Never played before? Start with Module One on Melody Island. It is free, and you go at your own pace.',
    to: '/courses',
    cta: 'Start Module One free',
  },
  {
    icon: Users,
    title: 'I am a parent',
    body: 'A refresher course so you can sit beside your child and help with practice, even if you last played years ago.',
    to: '/courses',
    cta: 'See the courses',
  },
  {
    icon: Music,
    title: 'I can play',
    body: 'You know your way around the keys and want to learn at home: chords, pop, jazz and improvisation.',
    to: '/courses',
    cta: 'Explore Progress at Home',
  },
  {
    icon: Award,
    title: 'I want a challenge',
    body: 'Preparing for an ABRSM Jazz Piano exam? Exam Island has the map, from scales to aural tests.',
    to: '/exam-island',
    cta: 'Visit Exam Island',
  },
]

const BENEFITS = ['Academic success', 'Auditory skills', 'Maths skills', 'Language skills', 'Patience', 'Self discipline', 'Being proactive', 'Confidence']
// Black keys sit after C, D, F, G and A
const BLACK_AFTER = [0, 1, 3, 4, 5]

const SCHOOLS = [
  { name: 'Newport Public School', address: 'Stuart St, Newport NSW 2106' },
  { name: 'St Lukes Grammar School', address: '210 Headland Rd, Dee Why NSW 2099' },
]

export default function Home() {
  const heroRef = useRef(null)
  const { data: testimonials } = useAsync(getTestimonials)

  // The one authored moment on this page: the headline surfaces word by word.
  // Opacity and blur only, so the water's shadow mask stays aligned with the words.
  useEffect(() => {
    const scope = createScope({ root: heroRef, mediaQueries: { reduce: '(prefers-reduced-motion: reduce)' } }).add((self) => {
      if (self.matches.reduce) return
      animate('.hero-word', { opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(90), ease: 'out(4)' })
      animate('.hero-after', { opacity: [0, 1], duration: 500, delay: stagger(80, { start: 450 }), ease: 'out(3)' })
    })
    return () => scope.revert()
  }, [])

  return (
    <>
      <CausticsBackground className="border-b border-line">
        {/* Captain Roc's ship drifts across the lagoon. Decorative, and parked for reduced-motion users. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 h-16 overflow-hidden">
          <div className="hero-ship absolute bottom-0 left-0">
            <div className="ship-bob">
              <PirateShipIcon className="h-16 w-14" />
            </div>
          </div>
        </div>
        <div ref={heroRef} className="mx-auto grid min-h-[min(640px,85dvh)] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              {HEADLINE.split(' ').map((word, i, all) => (
                <span key={i}>
                  <span data-shadow="text" className="hero-word inline-block">
                    {word}
                  </span>
                  {i < all.length - 1 && ' '}
                </span>
              ))}
            </h1>
            <p className="hero-after mt-6 max-w-xl text-lg sm:text-xl">
              A contemporary piano adventure for kids aged 5 to 15 and the grown-ups beside them. Sail from Melody Island to chords, pop, jazz and
              improvisation, one module at a time.
            </p>
            <div className="hero-after mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn btn-primary" data-shadow="box">
                Start Module One free
              </Link>
              <Link to="/about" className="btn btn-quiet bg-key/60">
                Meet Captain Roc
              </Link>
            </div>
          </div>
          <div className="hero-after hidden justify-center md:flex">
            <div data-shadow="box" className="grid size-64 place-items-center rounded-full border-[10px] border-deep bg-key shadow-[var(--shadow-lift)] lg:size-72">
              <img
                src="https://jazzroc.com/wp-content/uploads/2021/07/captain-rocs-logo-250px.png"
                alt="Captain Roc's logo, a sailing ship"
                width="200"
                height="200"
                className="size-44 object-contain lg:size-52"
              />
            </div>
          </div>
        </div>
      </CausticsBackground>

      {/* Path picker: four starting ports along one route */}
      <section aria-labelledby="paths-title" className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="paths-title" className="text-3xl sm:text-4xl">
          Where does your voyage begin?
        </h2>
        <ol className="relative mt-10 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute left-6 top-6 bottom-6 border-l-2 border-dashed border-deep/30 md:left-6 md:right-6 md:top-6 md:bottom-auto md:border-l-0 md:border-t-2" />
          {PATHS.map(({ icon: Icon, title, body, to, cta }) => (
            <li key={title} className="relative flex gap-5 md:flex-col md:gap-4">
              <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-deep text-key ring-8 ring-foam">
                <Icon aria-hidden size={22} />
              </span>
              <div>
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-deep-soft">{body}</p>
                <Link to={to} className="mt-3 inline-block font-bold text-lagoon">
                  {cta}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits as a playable octave */}
      <section aria-labelledby="benefits-title" className="bg-key py-20">
        <div className="mx-auto max-w-6xl px-4">
          <MarkerText as="div">
            <h2 id="benefits-title" className="text-3xl sm:text-4xl">
              Piano is good for <Mark type="highlight">more than music</Mark>
            </h2>
          </MarkerText>
          <p className="mt-4 max-w-2xl text-lg text-deep-soft">
            Learning piano builds skills that show up everywhere else in a child's life. Tap a key to hear it.
          </p>
          <div className="relative mt-10">
            <ul className="flex flex-col overflow-hidden rounded-2xl border-2 border-deep md:h-72 md:flex-row">
              {BENEFITS.map((benefit, i) => (
                <li key={benefit} className="flex-1 border-deep/20 not-last:border-b md:not-last:border-b-0 md:not-last:border-r">
                  <button
                    type="button"
                    onClick={() => playNote(C_MAJOR[i])}
                    className="flex h-16 w-full items-center px-5 text-left font-bold transition-colors hover:bg-foam active:bg-doubloon/40 md:h-full md:items-end md:justify-center md:px-2 md:pb-5 md:text-center"
                  >
                    {benefit}
                  </button>
                </li>
              ))}
            </ul>
            {/* Black keys: decorative, sit over the boundaries between white keys */}
            {BLACK_AFTER.map((i) => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute right-0 top-[var(--pos)] h-7 w-2/5 -translate-y-1/2 rounded-l-md bg-deep md:right-auto md:left-[var(--pos)] md:top-0 md:h-[58%] md:w-[7%] md:-translate-x-1/2 md:translate-y-0 md:rounded-l-none md:rounded-b-md"
                style={{ '--pos': `${((i + 1) / BENEFITS.length) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      {testimonials?.length > 0 && (
        <section aria-labelledby="quotes-title" className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="quotes-title" className="text-3xl sm:text-4xl">
            Families on board
          </h2>
          <p className="mt-3 text-deep-soft">Quotes lightly paraphrased from JazzRoc families' testimonials.</p>
          <div className="mt-10">
            <QuoteDeck items={testimonials} />
          </div>
        </section>
      )}

      <section aria-labelledby="where-title" className="border-y border-line bg-key/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <h2 id="where-title" className="text-3xl sm:text-4xl">
              Where Roc teaches
            </h2>
            <p className="mt-4 max-w-md text-lg text-deep-soft">
              Face to face lessons at two schools on the Northern Beaches, with every lesson waiting online for practice at home.
            </p>
          </div>
          <ul className="space-y-6">
            {SCHOOLS.map((s) => (
              <li key={s.name} className="flex gap-4">
                <MapPin aria-hidden className="mt-1 shrink-0 text-lagoon" size={24} />
                <div>
                  <h3 className="text-xl">{s.name}</h3>
                  <p className="text-deep-soft">{s.address}</p>
                  <a
                    className="font-bold text-lagoon"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${s.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions<span className="sr-only"> to {s.name} (opens in a new tab)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 py-20">
        <div className="on-deep rounded-[var(--radius-card)] bg-deep px-6 py-14 text-key sm:px-12">
          <MarkerText as="div">
            <h2 id="cta-title" className="max-w-2xl text-3xl sm:text-5xl">
              Module One is <Mark type="underline" color="#f2b53a">free</Mark>. Set sail today.
            </h2>
          </MarkerText>
          <p className="mt-4 max-w-xl text-lg text-foam/85">
            Create a family account, add your child's profile and start with Captain Roc's first five songs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn bg-doubloon text-deep hover:bg-key">
              Start Module One free
            </Link>
            <Link to="/contact" className="btn text-key shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.4)] hover:bg-key/10">
              Talk to Captain Roc
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
