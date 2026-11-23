import { getTransactions } from '../lib/transactions'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'
import { getFraudAssessment, type FraudAssessment } from '../lib/api'
import { useAuthToken } from '../context/AuthContext'



export default function LiveFraudCard() {
  const token = useAuthToken()

  const [assessment, setAssessment] =
    useState<FraudAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // ORVENDIQ_LIVE_FRAUD_CARD_SYNC
  useEffect(() => {
    if (!token) return

    const interval = window.setInterval(() => {
      setReloadKey((value) => value + 1)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [token])
  useEffect(() => {
    let active = true

    getTransactions(token, 0, 1).then((history) => {
      const latest = history.items?.[0]

      if (!latest) {
        throw new Error('No recent transaction available.')
      }

      return getFraudAssessment(latest.transactionId, token)
    })
      .then((data) => {
        if (active) {
          setAssessment(data)
          setError('')
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load fraud assessment'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, reloadKey])

  if (loading) {
    return (
      <div
        className="orv-card min-h-[230px] rounded-[25px] bg-[#D6C9E8] p-7"
        role="status"
        aria-label="Loading fraud assessment"
      >
        <div className="orv-skeleton mb-8 h-12 w-12 rounded-2xl" />
        <div className="orv-skeleton mb-3 h-3 w-32 rounded-lg" />
        <div className="orv-skeleton mb-4 h-9 w-36 rounded-xl" />
        <div className="orv-skeleton h-3 w-44 max-w-full rounded-lg" />
        <span className="sr-only">Loading fraud risk data</span>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="orv-card flex min-h-[230px] flex-col justify-between rounded-[25px] bg-[#D6C9E8] p-7">
        <AlertTriangle size={24} className="text-[#8271B1]" />
        <div>
          <p className="text-xs font-medium text-[#81749F]">
            Fraud assessment unavailable
          </p>
          <p role="alert" className="mt-2 text-sm text-[#514967]">
            {error || 'No assessment found'}
          </p>
          <button
            type="button"
            className="orv-button mt-4 inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-[#75659D]"
            onClick={() => {
              setLoading(true)
              setError('')
              setReloadKey((value) => value + 1)
            }}
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    )
  }

  const palette = {
    LOW: 'text-[#56866B]',
    MEDIUM: 'text-[#AB763B]',
    HIGH: 'text-[#B75563]',
  }[assessment.riskLevel] ?? 'text-[#514967]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="orv-card min-h-[230px] rounded-[25px] bg-[#D6C9E8] p-6 md:p-7"
    >
      <div className="mb-7 flex items-start justify-between">
        <div className="rounded-2xl bg-white/60 p-3 text-[#8071B1]">
          <ShieldCheck size={21} />
        </div>
        <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-semibold text-[#74639E]">
          Live API
        </span>
      </div>

      <p className="text-[12px] text-[#81749F]">
        Fraud risk assessment
      </p>

      <div className="mt-2 flex items-baseline gap-3">
        <h2 className="text-[clamp(24px,2.3vw,33px)] font-semibold tracking-[-0.05em]">
          {assessment.riskScore}/100
        </h2>
        <span className={`text-sm font-bold ${palette}`}>
          {assessment.riskLevel}
        </span>
      </div>

      <p className="mt-3 text-[11px] text-[#81749F]">
        Assessment for transaction #{assessment.transactionId}
      </p>
    </motion.div>
  )
}