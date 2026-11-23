import { useEffect, useState } from 'react'
import { Fingerprint, RefreshCw, ShieldCheck } from 'lucide-react'
import { useAuthToken } from '../context/AuthContext'
import { getFraudAssessment } from '../lib/api'
import { getTransactions } from '../lib/transactions'

type Assessment = Awaited<ReturnType<typeof getFraudAssessment>>

interface Props {
  onInvestigate: () => void
}

export default function LiveSecurityPulse({
  onInvestigate,
}: Props) {
  const token = useAuthToken()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [transactionId, setTransactionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'ready' | 'missing' | 'error'>('ready')
  const [version, setVersion] = useState(0)

  // ORVENDIQ_LIVE_FRAUD_AUTO_REFRESH
  useEffect(() => {
    if (!token) return

    const interval = window.setInterval(() => {
      setVersion((current) => current + 1)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [token])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setAssessment(null)
      setTransactionId(null)
      setStatus('ready')

      try {
        const history = await getTransactions(token, 0, 1)

        if (!active) return

        const latest = history.items[0]

        if (!latest) {
          setStatus('missing')
          return
        }

        setTransactionId(latest.transactionId)

        try {
          const result = await getFraudAssessment(
            latest.transactionId,
            token
          )

          if (active) {
            setAssessment(result)
            setStatus('ready')
          }
        } catch {
          if (active) {
            // Do not invent a score when assessment is unavailable.
            setStatus('missing')
          }
        }
      } catch {
        if (active) setStatus('error')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [token, version])

  const level = assessment?.riskLevel?.toUpperCase()
  const high = level === 'HIGH'
  const medium = level === 'MEDIUM'

  const riskColor = high
    ? 'text-[#A95366]'
    : medium
      ? 'text-[#AC8046]'
      : 'text-[#54826A]'

  return (
    <section className="rounded-[25px] border border-[#EADFE6] bg-[#F0E4EA] p-6 sm:p-7">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.025em]">
            Transaction risk pulse
          </h3>
          <p className="mt-1 text-[11px] text-[#A096A0]">
            Latest transaction assessment
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVersion((value) => value + 1)}
          disabled={loading}
          aria-label="Refresh risk assessment"
          className="orv-button rounded-xl p-2 text-[#8876B9] disabled:opacity-50"
        >
          <RefreshCw size={16}/>
        </button>
      </div>

      <div className="mb-7 flex items-center justify-center">
        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[12px] border-[#D6C9E8] bg-[#FCFAFF]">
          <Fingerprint
            size={25}
            className="mb-2 text-[#8876B9]"
          />

          {loading ? (
            <div
              role="status"
              aria-label="Loading risk assessment"
              className="orv-skeleton h-9 w-20 rounded-xl"
            />
          ) : assessment ? (
            <>
              <span className="text-[30px] font-semibold tracking-[-0.06em] text-[#463740]">
                {assessment.riskScore}
                <span className="text-sm text-[#A39AA9]">
                  /100
                </span>
              </span>
              <span className={`text-[10px] font-semibold ${riskColor}`}>
                {assessment.riskLevel}
              </span>
            </>
          ) : (
            <>
              <span className="text-[23px] font-semibold text-[#8876B9]">
                —
              </span>
              <span className="text-[10px] text-[#A39AA9]">
                Not assessed
              </span>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-[#FAF8FE] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-[#8373B1]"
          />

          <div className="min-w-0 flex-1">
            {loading ? (
              <p className="text-[11px] text-[#766F83]">
                Checking the latest transaction...
              </p>
            ) : assessment ? (
              <p className="text-[11px] leading-relaxed text-[#766F83]">
                Transaction #{assessment.transactionId} has
                a {assessment.riskLevel} risk assessment.
                This score applies only to this transaction.
              </p>
            ) : (
              <p className="text-[11px] leading-relaxed text-[#766F83]">
                {status === 'error'
                  ? 'Unable to load recent transactions.'
                  : transactionId !== null
                    ? `No available fraud assessment for transaction #${transactionId}.`
                    : 'No transaction is available for assessment.'}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onInvestigate}
          className="orv-button mt-4 w-full rounded-xl bg-[#D6C9E8] px-4 py-3 text-xs font-semibold text-[#594A75]"
        >
          Open Fraud Analytics
        </button>
      </div>
    </section>
  )
}