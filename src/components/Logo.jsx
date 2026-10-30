import { Link } from 'react-router'

// Client's existing logo, hotlinked for the demo. Move into /public before launch.
const LOGO_URL = 'https://jazzroc.com/wp-content/uploads/2021/07/captain-rocs-logo-250px.png'

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="flex items-center gap-3 no-underline">
      <img src={LOGO_URL} alt="" width="48" height="48" className="h-12 w-12 rounded-full bg-key object-contain p-0.5" />
      <span className={`font-display text-xl leading-none ${light ? 'text-key' : 'text-deep'}`}>
        JazzRoc
        <span className={`block font-body text-sm ${light ? 'text-foam/80' : 'text-deep-soft'}`}>with Captain Roc</span>
      </span>
    </Link>
  )
}
