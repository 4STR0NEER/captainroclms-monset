import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-4xl sm:text-5xl">Off the edge of the map</h1>
      <p className="mt-4 max-w-xl text-lg text-deep-soft">
        We couldn't find that page. It may have moved, or the link may have a typo. Let's get you back to familiar waters.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the home page
        </Link>
        <Link to="/contact" className="btn btn-quiet">
          Contact Captain Roc
        </Link>
      </div>
    </div>
  )
}
