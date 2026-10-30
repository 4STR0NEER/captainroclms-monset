// Temporary stand-in for pages that later phases will build.
export default function ComingSoon({ title, phase }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-4 text-lg text-deep-soft">This page is built in Phase {phase}.</p>
    </div>
  )
}
