import AnimatedHeading from './AnimatedHeading'
import { getTransactions } from '../lib/transactions'
import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import {
  AlertCircle, ArrowRight, Clock3, RefreshCw,
  Search, ShieldAlert, ShieldCheck
} from 'lucide-react'
import { getFraudAssessment, type FraudAssessment } from '../lib/api'
import { useAuthToken } from '../context/AuthContext'

function readIndicators(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function formatIndicator(value: string) {
  return value.replaceAll('_', ' ').toLowerCase()
}

function AssessmentSkeleton() {
  return (
    <div role="status" aria-label="Loading assessment" className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="orv-skeleton h-48 rounded-[25px]" />
        <div className="orv-skeleton h-48 rounded-[25px]" />
      </div>
      <div className="orv-skeleton h-40 rounded-[25px]" />
      <span className="sr-only">Loading assessment data</span>
    </div>
  )
}

export default function FraudAnalyticsPage() {
  const token = useAuthToken()
  const [input, setInput] = useState('22')
  const [transactionId, setTransactionId] = useState(22)
  const [requestVersion, setRequestVersion] = useState(0)
  const [assessment, setAssessment] = useState<FraudAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setAssessment(null)

    getFraudAssessment(transactionId, token)
      .then((result) => {
        if (active) setAssessment(result)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Unable to retrieve assessment.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [transactionId, requestVersion, token])

  // ORVENDIQ_FRAUD_ANALYTICS_AUTO_SYNC
  useEffect(() => {
    if (!token) return

    let active = true
    let inFlight = false

    const syncLatest = async () => {
      if (inFlight) return
      inFlight = true

      try {
        const history = await getTransactions(token, 0, 1)
        if (!active) return

        const latest = history.items?.[0]

        if (latest?.transactionId != null) {
          setTransactionId(latest.transactionId)
        }

        // Recheck the current assessment, including pending results.
        setRequestVersion((value) => value + 1)
      } catch (error) {
        console.warn('Fraud Analytics auto-sync failed', error)
      } finally {
        inFlight = false
      }
    }

    void syncLatest()

    const interval = window.setInterval(() => {
      void syncLatest()
    }, 10000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [token])

  function investigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleaned = input.trim()
    const id = Number(cleaned)

    if (!/^[1-9][0-9]*$/.test(cleaned) || !Number.isSafeInteger(id)) {
      setValidationError('Enter a valid positive transaction ID.')
      return
    }

    setValidationError('')
    if (id === transactionId) {
      setRequestVersion((value) => value + 1)
    } else {
      setTransactionId(id)
    }
  }

  const indicators = assessment
    ? readIndicators(assessment.indicators)
    : []

  const riskColors: Record<string, string> = {
    LOW: 'bg-[#DCEFE7] text-[#477B5E]',
    MEDIUM: 'bg-[#FFE9D5] text-[#9D6B38]',
    HIGH: 'bg-[#F2CAD5] text-[#A34B63]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#916D85]">
          Intelligence / Investigation
        </p>
        {/* ORVENDIQ_PAGE_WORD_REVEAL */}
<AnimatedHeading
  text="Fraud intelligence"
  as="h1"
  className="text-[clamp(28px,3vw,39px)] font-semibold tracking-[-0.055em]"
>
  {' '}
  <span className="text-[#986F8C]">✳</span>
</AnimatedHeading>
        <p className="mt-2 text-[13px] text-[#75636F]">
          Explore transaction risk, one assessment at a time.
        </p>
      </div>

      <section className="rounded-[25px] border border-[#D9C5D1] bg-[#F0E4EA] p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-[#D8B7CA] p-3 text-[#68465C]">
            <Search size={20}/>
          </div>
          <div>
            <h2 className="font-semibold">Investigate a transaction</h2>
            <p className="mt-1 text-xs text-[#75636F]">
              Search for an existing fraud assessment.
            </p>
          </div>
        </div>

        <form onSubmit={investigate} className="space-y-3">
          <label htmlFor="fraud-transaction-id" className="block text-xs font-semibold">
            Transaction ID
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="fraud-transaction-id"
              type="text"
              inputMode="numeric"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                setValidationError('')
              }}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'fraud-input-error' : undefined}
              placeholder="e.g. 22"
              className="min-w-0 flex-1 rounded-2xl border border-[#D9C5D1] bg-[#F7EEF4] px-4 py-3 text-sm outline-none focus:border-[#946C86] focus:ring-2 focus:ring-[#D8B7CA]"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { y: -2 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#785467] px-6 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              <Search size={16} />
              Investigate
              <ArrowRight size={15} />
            </motion.button>
          </div>
          {validationError && (
            <p id="fraud-input-error" role="alert" className="text-xs text-[#A34B63]">
              {validationError}
            </p>
          )}
        </form>
      </section>

      {loading ? (
        <AssessmentSkeleton />
      ) : error || !assessment ? (
        <section className="rounded-[25px] border border-[#D9C5D1] bg-[#F0E4EA] p-7">
          <AlertCircle size={24} className="mb-4 text-[#95647D]" />
          <h2 className="font-semibold">Assessment unavailable</h2>
          <p role="alert" className="mt-2 text-sm text-[#75636F]">
            {error || 'No assessment was returned.'}
          </p>
          <button
            onClick={() => setRequestVersion((value) => value + 1)}
            className="orv-button mt-5 flex items-center gap-2 rounded-xl bg-[#D8B7CA] px-4 py-3 text-xs font-semibold"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </section>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="orv-card rounded-[25px] bg-[#D6C9E8] p-7">
              <ShieldCheck size={23} className="mb-7 text-[#75618D]"/>
              <p className="text-xs text-[#594C6D]">Risk score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-[-0.06em]">
                  {assessment.riskScore}
                </span>
                <span className="text-sm text-[#594C6D]">/ 100</span>
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full bg-[#816C9E]"
                  style={{
                    width: `${Math.max(0, Math.min(100, assessment.riskScore))}%`
                  }}
                />
              </div>
            </div>
            <div className="orv-card rounded-[25px] bg-[#D8B7CA] p-7">
              <ShieldAlert size={23} className="mb-7 text-[#77536B]"/>
              <p className="text-xs text-[#684E60]">Risk classification</p>
              <div className="mt-4">
                <span className={`rounded-xl px-4 py-2 text-lg font-bold ${riskColors[assessment.riskLevel] ?? ''}`}>
                  {assessment.riskLevel}
                </span>
              </div>
              <p className="mt-7 text-xs text-[#684E60]">
                {indicators.length} recorded risk indicator(s)
              </p>
            </div>
          </div>

          <section className="rounded-[25px] border border-[#D9C5D1] bg-[#F0E4EA] p-7">
            <h2 className="mb-2 text-base font-semibold">Why this risk score?</h2>
            <p className="mb-6 text-xs text-[#75636F]">
              Indicators recorded by the rule-based fraud engine.
            </p>
            {indicators.length ? (
              <div className="space-y-3">
                {indicators.map((indicator, index) => (
                  <div key={`${indicator}-${index}`} className="orv-card flex items-center gap-3 rounded-2xl bg-[#E8D8E2] p-4">
                    <AlertCircle size={17} className="text-[#91657F]"/>
                    <span className="text-sm font-medium capitalize">
                      {formatIndicator(indicator)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#E8D8E2] p-5 text-sm text-[#66545E]">
                No risk indicators were recorded for this assessment.
              </div>
            )}
          </section>

          <section className="rounded-[25px] border border-[#D9C5D1] bg-[#F0E4EA] p-7">
            <h2 className="mb-5 font-semibold">Assessment details</h2>
            <div className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-[#75636F]">Transaction</p>
                <p className="font-semibold">#{assessment.transactionId}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#75636F]">Assessment type</p>
                <p className="font-semibold">Retrospective · Rule-based</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#75636F]">Assessed at</p>
                <p className="flex items-center gap-2 font-semibold">
                  <Clock3 size={14}/>
                  {assessment.assessedAt
                    ? assessment.assessedAt.replace('T', ' ').slice(0, 19)
                    : 'Unavailable'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#75636F]">Data source</p>
                <p className="font-semibold">Spring Boot · Oracle</p>
              </div>
            </div>
          </section>
        </>
      )}

      <p className="text-xs leading-5 text-[#75636F]">
        Fraud scores are based on demonstrative rules and do not establish
        whether a transaction is fraudulent.
      </p>
    </motion.div>
  )
}