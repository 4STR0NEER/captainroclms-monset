// Captain Roc's ship: red hull, white sails and a flag with a music note instead of a skull.
// PirateShip is an SVG group (for use inside another SVG); PirateShipIcon is a standalone picture.
const DEEP = '#0e2a47'

export function PirateShip() {
  return (
    <g>
      <ellipse cy="22" rx="34" ry="6" fill="#ffffff" fillOpacity="0.25" />
      <path d="M0 6V-44" stroke={DEEP} strokeWidth="3" />
      <path d="M-18 -36Q0 -30 18 -36L16 -8Q0 -12 -16 -8Z" fill="#ffffff" stroke={DEEP} strokeWidth="2" />
      <path d="M-12 -6Q0 -9 12 -6L11 2Q0 0 -11 2Z" fill="#ffffff" stroke={DEEP} strokeWidth="2" />
      <path d="M1 -52h20v13H1Z" fill={DEEP} />
      <circle cx="9" cy="-42" r="2.6" fill="#ffffff" />
      <path d="M11.3 -42V-49.5L15 -48" stroke="#ffffff" strokeWidth="1.6" fill="none" />
      <path d="M-32 4Q0 11 32 4L23 21Q0 25 -23 21Z" fill="#d93f4c" stroke={DEEP} strokeWidth="2" />
      {[-14, 0, 14].map((cx) => (
        <circle key={cx} cx={cx} cy="13" r="2.5" fill="#ffffff" />
      ))}
    </g>
  )
}

export function PirateShipIcon({ className }) {
  return (
    <svg viewBox="-38 -56 76 84" className={className} aria-hidden>
      <PirateShip />
    </svg>
  )
}
