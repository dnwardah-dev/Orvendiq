import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  UserRound,
  ShieldCheck,
  Clock3,
  RotateCcw,
  Info,
  CheckCircle2,
  Settings2,
} from 'lucide-react'
import { useAuthToken } from '../context/AuthContext'

const TIME_KEY = 'orvendiq.settings.timeFormat'

type TimeFormat = '12h' | '24h'

function readTime(): TimeFormat {
  try {
    return localStorage.getItem(TIME_KEY) === '12h'
      ? '12h'
      : '24h'
  } catch {
    return '24h'
  }
}

function getExpiry(token: string): number | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null

    const base64 = segment
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      '='
    )

    const payload = JSON.parse(atob(padded)) as {
      exp?: unknown
    }

    return typeof payload.exp === 'number'
      ? payload.exp * 1000
      : null
  } catch {
    return null
  }
}

export default function SettingsPage() {
  const token = useAuthToken()

  const [timeFormat, setTimeFormat] =
    useState<TimeFormat>(readTime)

  const [now, setNow] = useState(() => Date.now())
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // Remove obsolete local animation preference.
    try {
      localStorage.removeItem(
        'orvendiq.settings.reduceMotion'
      )
    } catch {
      // Storage may be unavailable.
    }

    const timer = window.setInterval(
      () => setNow(Date.now()),
      1000
    )

    return () => window.clearInterval(timer)
  }, [])

  const expiry = getExpiry(token)
  const expired = expiry !== null && now >= expiry

  const minutes = expiry === null
    ? null
    : Math.max(0, Math.ceil((expiry - now) / 60000))

  const timePreview = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  }).format(new Date(now))

  function saveTime(value: TimeFormat) {
    try {
      localStorage.setItem(TIME_KEY, value)
      setTimeFormat(value)
      setNotice('Time preference saved.')
    } catch {
      setNotice('Unable to save preference.')
    }
  }

  function reset() {
    try {
      localStorage.removeItem(TIME_KEY)
      setTimeFormat('24h')
      setNotice('Preferences restored.')
    } catch {
      setNotice('Unable to reset preferences.')
    }
  }

  const panel =
    'rounded-[25px] border border-[#EADFE6] bg-[#F0E4EA] p-6 md:p-7'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-[#514451]"
    >
      <header>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#916D85]">
          Workspace / Preferences
        </p>

        <h1 className="text-[clamp(28px,3vw,39px)] font-semibold tracking-[-0.055em]">
          Settings <span className="text-[#986F8C]">✳</span>
        </h1>

        <p className="mt-2 text-[13px] text-[#75636F]">
          Make your financial workspace feel like yours.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <UserRound size={21} />
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-xs text-[#897C87]">
                Your demo workspace
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 p-4">
            <p className="text-sm font-semibold">
              Financial Simulation Account
            </p>
            <p className="mt-2 text-xs leading-5 text-[#897C87]">
              Orvendiq uses simulated financial accounts.
              Profile editing is not available in this version.
            </p>
          </div>
        </section>

        <section className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck size={21} />
            <div>
              <h2 className="font-semibold">
                Security & Session
              </h2>
              <p className="text-xs text-[#897C87]">
                Authentication information
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-white/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Session status</span>
              <span className={
                expired
                  ? 'font-semibold text-[#A95366]'
                  : 'font-semibold text-[#54826A]'
              }>
                {expired ? 'Expired' : 'Authenticated'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Time remaining</span>
              <span className="text-sm font-semibold">
                {minutes === null
                  ? 'Unavailable'
                  : `${minutes} min`}
              </span>
            </div>

            <p className="text-xs leading-5 text-[#897C87]">
              Session information is estimated locally
              from the JWT expiration claim.
            </p>
          </div>
        </section>

        <section className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <Clock3 size={21} />
            <div>
              <h2 className="font-semibold">
                Preferences
              </h2>
              <p className="text-xs text-[#897C87]">
                Saved in your browser
              </p>
            </div>
          </div>

          <p className="mb-3 text-sm font-medium">
            Time format
          </p>

          <div className="flex gap-3">
            {(['12h', '24h'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={timeFormat === value}
                onClick={() => saveTime(value)}
                className={
                  'orv-button rounded-xl px-5 py-3 text-sm font-semibold ' +
                  (timeFormat === value
                    ? 'bg-[#785467] text-white'
                    : 'bg-white/70 text-[#785467]')
                }
              >
                {value === '12h'
                  ? '12-hour'
                  : '24-hour'}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-[#897C87]">
            Preview: {timePreview}
          </p>

          <p className="mt-2 text-xs leading-5 text-[#897C87]">
            Time format currently applies to this preview.
          </p>

          <button
            type="button"
            onClick={reset}
            className="orv-button mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E8D8E2] px-4 py-3 text-xs font-semibold text-[#785467]"
          >
            <RotateCcw size={15} />
            Reset preferences
          </button>

          {notice && (
            <p
              role="status"
              className="mt-3 flex items-center gap-2 text-xs text-[#54826A]"
            >
              <CheckCircle2 size={15} />
              {notice}
            </p>
          )}
        </section>

        <section className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <Info size={21} />
            <div>
              <h2 className="font-semibold">
                About Orvendiq
              </h2>
              <p className="text-xs text-[#897C87]">
                Fintech engineering portfolio
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p><strong>Frontend:</strong> React + TypeScript</p>
            <p><strong>Backend:</strong> Java + Spring Boot</p>
            <p><strong>Database:</strong> Oracle</p>
            <p><strong>Animation:</strong> GSAP, Motion, Lenis</p>
          </div>

          <div className="mt-5 rounded-2xl bg-white/60 p-4 text-xs leading-5 text-[#897C87]">
            Orvendiq is a portfolio financial simulation.
            It does not transfer real funds.
            Fraud assessments use heuristic rules.
          </div>
        </section>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#897C87]">
        <Settings2 size={15} />
        Settings do not modify Oracle financial records.
      </div>
    </motion.div>
  )
}