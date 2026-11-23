import { useEffect } from 'react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight, Eye, EyeOff, Flower2,
  LockKeyhole, ShieldCheck, Sparkles,
  LogOut, LoaderCircle
} from 'lucide-react'
import { login } from '../lib/api'
import { AuthTokenContext } from '../context/AuthContext'

interface AuthGateProps {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ORVENDIQ_AUTO_SESSION_EXPIRY
  useEffect(() => {
    if (!token) return

    let active = true
    const previousFetch = window.fetch

    const originalFetch = previousFetch.bind(window)

    const sessionAwareFetch: typeof window.fetch = async (
      input,
      init
    ) => {
      const response = await originalFetch(input, init)

      const requestUrl = new URL(
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
        window.location.origin
      )

      const isProtectedApi =
        requestUrl.origin === window.location.origin &&
        requestUrl.pathname.startsWith('/api/v1/') &&
        !requestUrl.pathname.startsWith('/api/v1/auth/')

      if (
        active &&
        isProtectedApi &&
        response.status === 401
      ) {
        setToken(null)
        setPassword('')
        setError(
          'Sesi kamu telah berakhir. Silakan login kembali.'
        )
      }

      return response
    }

    window.fetch = sessionAwareFetch

    return () => {
      active = false

      if (window.fetch === sessionAwareFetch) {
        window.fetch = previousFetch
      }
    }
  }, [token])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLoading) return

    setError('')

    if (!username.trim() || !password) {
      setError('Please enter your username and password.')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(username.trim(), password)

      if (!result.accessToken) {
        throw new Error('No access token received.')
      }

      setToken(result.accessToken)
      setPassword('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    setToken(null)
    setPassword('')
    setError('')
  }

  if (token) {
    return (
      <div>
        <div className="fixed bottom-5 right-5 z-50">
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-[#EADDE6] bg-white px-4 py-3 text-xs font-semibold text-[#865B7C] shadow-lg shadow-[#513D50]/10"
          >
            <LogOut size={15} />
            Sign out
          </motion.button>
        </div>
        <AuthTokenContext.Provider value={{ accessToken: token }}>{children}</AuthTokenContext.Provider>
      </div>
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#E8D8E2] px-5 py-12">
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#D8B7CA]/55 blur-[90px]" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-[#D6C9E8]/55 blur-[100px]" />

      <div className="relative grid w-full max-w-[1060px] overflow-hidden rounded-[32px] border border-[#EEE6EB] bg-white shadow-[0_25px_90px_rgba(80,58,76,0.07)] lg:grid-cols-2">

        <section className="relative hidden min-h-[630px] flex-col justify-between overflow-hidden bg-[#D8B7CA] p-11 lg:flex">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-[#A36E91]">
              <Flower2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-[-0.07em] text-[#493743]">
              orvendiq.
            </span>
          </div>

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-10 flex h-48 w-48 items-center justify-center rounded-[50px] border border-white/70 bg-white/45 shadow-xl shadow-[#B8799D]/10"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-[40px] bg-white/80 text-[#A36E91]">
                <ShieldCheck size={62} strokeWidth={1.2} />
              </div>
            </motion.div>

            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.23em] text-[#9B6684]">
              Financial intelligence studio
            </p>
            <h1 className="max-w-sm text-[43px] font-semibold leading-[1.12] tracking-[-0.065em] text-[#4B3948]">
              A little more clarity.
              <br />
              A lot more confidence.
            </h1>
            <p className="mt-6 max-w-xs text-sm leading-7 text-[#916F83]">
              A thoughtful space for financial activity, secure transfers,
              and explainable fraud insights.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-[#996F88]">
            <Sparkles size={17} />
            Made for curious minds.
          </div>

          <div className="pointer-events-none absolute -bottom-32 -right-28 h-[350px] w-[350px] rounded-full border-[65px] border-white/20" />
          <div className="pointer-events-none absolute -right-20 top-10 h-44 w-44 rounded-full border-[35px] border-white/20" />
        </section>

        <section className="flex flex-col justify-center px-7 py-12 sm:px-14 lg:px-16">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="rounded-2xl bg-[#D8B7CA] p-3 text-[#A36E91]">
              <Flower2 size={21} />
            </div>
            <span className="text-xl font-bold tracking-[-0.06em]">orvendiq.</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#AC86A1]">
              Your workspace awaits
            </p>
            <h2 className="text-[36px] font-semibold tracking-[-0.06em] text-[#38323D]">
              Welcome back <span className="text-[#B984A5]">♡</span>
            </h2>
            <p className="mb-10 mt-3 text-[13px] text-[#988D99]">
              Sign in to your financial intelligence studio.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="orv-username" className="mb-2 block text-xs font-semibold text-[#605762]">
                  Username
                </label>
                <input
                  id="orv-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-2xl border border-[#ECE5E9] bg-[#F0E4EA] px-4 py-4 text-sm text-[#3E3540] outline-none transition focus:border-[#B984A5] focus:ring-4 focus:ring-[#D8B7CA]/60"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="orv-password" className="mb-2 block text-xs font-semibold text-[#605762]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="orv-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[#ECE5E9] bg-[#F0E4EA] px-4 py-4 pr-12 text-sm text-[#3E3540] outline-none transition focus:border-[#B984A5] focus:ring-4 focus:ring-[#D8B7CA]/60"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A396A2] hover:text-[#865B7C]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-2xl border border-[#F2D7D7] bg-[#FFF5F5] px-4 py-3 text-xs leading-5 text-[#A94F5A]">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={isLoading ? {} : { y: -2 }}
                whileTap={isLoading ? {} : { scale: 0.97 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#A16C93] px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(161,108,147,0.2)] transition hover:bg-[#8E5A80] disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={17} />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Enter my workspace
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-9 flex items-center justify-center gap-2 text-[11px] text-[#A097A2]">
              <LockKeyhole size={14} />
              JWT-secured demo environment
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}