import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Captions, ChevronRight, CircleCheck, CircleDot, ExternalLink, FileMusic, Lock, PlayCircle } from 'lucide-react'
import { Loading, PlaceholderTag } from '../../components/ui'
import ShipWheelTimer from '../../components/ShipWheelTimer'
import CoinBurst from '../../components/CoinBurst'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { localIso } from '../../utils/dates'
import { getLesson, getLessons, getStudentMap } from '../../services/courses'
import { addPracticeLog, getProgress, setLessonStatus } from '../../services/progress'
import NotFound from '../shared/NotFound'

async function loadLesson(id, studentId) {
  const lesson = await getLesson(id)
  if (!lesson) return null
  const [islands, moduleLessons, progress] = await Promise.all([getStudentMap(studentId), getLessons(lesson.module.id), getProgress(studentId)])
  const island = islands.find((i) => i.id === lesson.module.islandId)
  const module = island.modules.find((m) => m.id === lesson.module.id)
  const nextModule = island.modules.find((m) => m.order === module.order + 1)
  const nextModuleFirst = nextModule ? (await getLessons(nextModule.id))[0] : null
  const statuses = Object.fromEntries(progress.filter((p) => moduleLessons.some((l) => l.id === p.lessonId)).map((p) => [p.lessonId, p.status]))
  return { lesson, island, module, moduleLessons, nextModuleFirst, statuses }
}

export default function LessonPlayer() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading } = useAsync(() => loadLesson(id, user.id), [id, user.id])
  if (loading) return <Loading label="Hoisting the sails…" />
  if (!data) return <NotFound />
  // key resets the player's local state when moving to the next lesson
  return <Player key={id} {...data} studentId={user.id} />
}

function Player({ lesson, island, module, moduleLessons, nextModuleFirst, statuses: initialStatuses, studentId }) {
  const [statuses, setStatuses] = useState(initialStatuses)
  const [message, setMessage] = useState('')
  const [burst, setBurst] = useState(0)
  const pdfs = lesson.resources.filter((r) => r.kind === 'pdf')
  const videos = lesson.resources.filter((r) => r.kind === 'video' || r.kind === 'youtube')
  const [sheet, setSheet] = useState(pdfs[0]?.id)
  const activeSheet = pdfs.find((p) => p.id === sheet)
  const status = statuses[lesson.id] ?? 'not started'
  const next = moduleLessons.find((l) => l.order === lesson.order + 1) ?? nextModuleFirst

  if (module.state.startsWith('locked')) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Lock aria-hidden className="text-buoy" size={32} />
        <h1 className="mt-4 text-4xl">These waters are still locked</h1>
        <p className="mt-3 text-lg text-deep-soft">
          {module.state === 'locked-tier' ? `${module.title} is part of a course you haven't joined yet.` : `Finish the module before ${module.title.split(':')[0]} to sail here.`}
        </p>
        <Link to={`/app/island/${island.slug}`} className="btn btn-primary mt-6">
          Back to {island.name}
        </Link>
      </div>
    )
  }

  async function mark(newStatus) {
    await setLessonStatus(studentId, lesson.id, newStatus)
    const updated = { ...statuses, [lesson.id]: newStatus }
    setStatuses(updated)
    if (newStatus === 'practised') {
      setMessage('Nice work, matey! Keep practising until it feels easy, then tap "I\'ve got it!"')
      return
    }
    setBurst((n) => n + 1)
    const moduleDone = moduleLessons.every((l) => updated[l.id] === 'complete')
    setMessage(
      moduleDone
        ? `Shiver me timbers! You finished ${module.title.split(':')[0]}. New waters are open on the map!`
        : 'Shiver me timbers! Lesson complete. Another doubloon for your chest!',
    )
  }

  async function logPractice(minutes) {
    await addPracticeLog({ studentId, date: localIso(), minutes, lessonId: lesson.id })
    setMessage(`Logged ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} in your Captain's log. Arrr, well played!`)
  }

  return (
    <div>
      <header className="mx-auto max-w-6xl px-4 pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-deep-soft">
          <Link to={`/app/island/${island.slug}`} className="font-bold text-lagoon">
            {island.name}
          </Link>
          <ChevronRight aria-hidden size={16} />
          <span>{module.title.split(':')[0]}</span>
          <ChevronRight aria-hidden size={16} />
          <span>Lesson {lesson.order}</span>
        </nav>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl sm:text-5xl">{lesson.title}</h1>
          {lesson.placeholder && <PlaceholderTag>Placeholder lesson</PlaceholderTag>}
        </div>
      </header>

      {/* Landscape tablets and desktops: music left, videos and tools right. Portrait: stacked. */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 px-4 lg:grid-cols-[1.3fr_1fr] landscape:md:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="sheet-title" className="rounded-[var(--radius-card)] bg-key p-4 shadow-[var(--shadow-lift)] sm:p-5">
          <h2 id="sheet-title" className="flex items-center gap-2 text-2xl">
            <FileMusic aria-hidden className="text-lagoon" size={24} /> Sheet music
          </h2>
          {pdfs.length > 1 && (
            <div role="group" aria-label="Choose a page" className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {pdfs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p.id === sheet}
                  onClick={() => setSheet(p.id)}
                  className={`btn min-h-11 shrink-0 text-sm ${p.id === sheet ? 'bg-deep text-key' : 'btn-quiet'}`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
          {activeSheet?.url ? (
            <>
              <iframe key={activeSheet.id} src={activeSheet.url} title={`Sheet music: ${activeSheet.title}`} className="mt-4 h-[70vh] w-full rounded-xl border border-line bg-foam" />
              <a href={activeSheet.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-bold text-lagoon">
                Open {activeSheet.title} full screen <ExternalLink aria-hidden size={16} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              {activeSheet.urlVerified === false && (
                <p className="mt-2">
                  <PlaceholderTag>Page-to-file match to confirm</PlaceholderTag>
                </p>
              )}
            </>
          ) : (
            <MediaPlaceholder icon={FileMusic} title={activeSheet ? `${activeSheet.title} is on its way` : 'No sheet music for this lesson'} body="Captain Roc's sheet music will appear here." />
          )}
        </section>

        <div className="space-y-6">
          {videos.length > 0 && (
            <section aria-labelledby="video-title" className="rounded-[var(--radius-card)] bg-key p-4 shadow-[var(--shadow-lift)] sm:p-5">
              <h2 id="video-title" className="flex items-center gap-2 text-2xl">
                <PlayCircle aria-hidden className="text-lagoon" size={24} /> Watch and play along
              </h2>
              <ul className="mt-4 space-y-4">
                {videos.map((v) => (
                  <li key={v.id}>
                    <VideoPlayer resource={v} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lesson.notes && (
            <section aria-labelledby="notes-title" className="rounded-[var(--radius-card)] bg-deep p-5 text-key">
              <h2 id="notes-title" className="text-2xl">
                Captain's orders
              </h2>
              <p className="mt-2 text-lg text-foam/90">{lesson.notes}</p>
            </section>
          )}

          <section aria-labelledby="timer-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
            <h2 id="timer-title" className="text-2xl">
              Practice timer
            </h2>
            <div className="mt-4">
              <ShipWheelTimer onLog={logPractice} />
            </div>
          </section>
        </div>
      </div>

      {/* Big, thumb-friendly actions that stay put while the student plays */}
      <div className="sticky bottom-0 z-30 mt-8 border-t border-line bg-key/95 backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <CoinBurst trigger={burst} />
          <p aria-live="polite" className="w-full text-center font-bold sm:order-last sm:w-auto sm:flex-1 sm:text-left empty:hidden">
            {message}
          </p>
          {status === 'not started' && (
            <button type="button" onClick={() => mark('practised')} className="btn btn-quiet flex-1 sm:flex-none">
              <CircleDot aria-hidden size={20} /> Mark as practised
            </button>
          )}
          {status !== 'complete' ? (
            <button type="button" onClick={() => mark('complete')} className="btn flex-1 bg-doubloon text-deep hover:bg-doubloon/80 sm:flex-none">
              <CircleCheck aria-hidden size={20} /> I've got it!
            </button>
          ) : (
            <span className="inline-flex min-h-12 items-center gap-2 font-bold text-lagoon">
              <CircleCheck aria-hidden size={22} /> Lesson complete
            </span>
          )}
          {next ? (
            <Link to={`/app/lesson/${next.id}`} className="btn btn-primary flex-1 sm:ml-auto sm:flex-none">
              Next lesson <ChevronRight aria-hidden size={18} />
            </Link>
          ) : (
            <Link to={`/app/island/${island.slug}`} className="btn btn-primary flex-1 sm:ml-auto sm:flex-none">
              Back to {island.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoPlayer({ resource }) {
  if (!resource.url) {
    return <MediaPlaceholder icon={PlayCircle} title={resource.title} body="Video to come. Captions will be added for every video." tag="Placeholder video" />
  }
  if (resource.kind === 'youtube') {
    // Privacy-enhanced embed: no YouTube cookies until the student presses play
    return (
      <figure>
        <iframe
          src={resource.url.replace('youtube.com/watch?v=', 'youtube-nocookie.com/embed/')}
          title={resource.title}
          className="aspect-video w-full rounded-xl"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <figcaption className="mt-2 font-bold">{resource.title}</figcaption>
      </figure>
    )
  }
  return (
    <figure>
      <video controls preload="metadata" className="aspect-video w-full rounded-xl bg-deep">
        <source src={resource.url} type="video/mp4" />
        {resource.captions && <track kind="captions" src={resource.captions} srcLang="en" label="English" default />}
      </video>
      <figcaption className="mt-2 font-bold">{resource.title}</figcaption>
    </figure>
  )
}

function MediaPlaceholder({ icon: Icon, title, body, tag }) {
  return (
    <div className="mt-4 grid aspect-video place-items-center rounded-xl border-2 border-dashed border-deep/20 bg-foam p-6 text-center">
      <div>
        <Icon aria-hidden className="mx-auto text-deep-soft" size={36} />
        <p className="mt-2 font-bold">{title}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-deep-soft">
          {Icon === PlayCircle && <Captions aria-hidden size={16} />}
          {body}
        </p>
        {tag && (
          <p className="mt-2">
            <PlaceholderTag>{tag}</PlaceholderTag>
          </p>
        )}
      </div>
    </div>
  )
}
