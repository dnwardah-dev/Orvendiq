import { useEffect, useState } from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import { getTransactions } from '../lib/transactions'
import { useAuthToken } from '../context/AuthContext'

export default function LiveTransactionCount() {
  const token = useAuthToken()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError('')

    getTransactions(token, 0, 1, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setCount(response.totalElements)
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setCount(null)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Unable to load transactions.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [token, version])

  return (
    <div className="orv-card rounded-[25px] bg-[#DCEFE7] p-6 md:p-7">
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-2xl bg-white/60 p-3 text-[#5E997C]">
          <ArrowLeftRight size={21}/>
        </div>
        <button
          type="button"
          onClick={() => setVersion((value) => value + 1)}
          disabled={loading}
          title="Refresh transaction count"
          aria-label="Refresh transaction count"
          className="orv-button rounded-xl p-2 text-[#5E997C] disabled:opacity-50"
        >
          <RefreshCw size={17}/>
        </button>
      </div>

      <p className="text-[12px] text-[#638B77]">
        Total transactions
      </p>

      {loading ? (
        <div
          role="status"
          aria-label="Loading transaction count"
          className="orv-skeleton mt-3 h-9 w-24 rounded-xl"
        />
      ) : error ? (
        <div>
          <p className="mt-2 text-sm font-semibold text-[#8D4659]">
            Unavailable
          </p>
          <p role="alert" className="mt-2 text-[11px] text-[#8D4659]">
            {error}
          </p>
        </div>
      ) : (
        <h2 className="mt-2 text-[clamp(24px,2.3vw,33px)] font-semibold tracking-[-0.05em]">
          {count?.toLocaleString('id-ID') ?? '—'}
        </h2>
      )}

      <p className="mt-4 text-[11px] text-[#719D88]">
        Account activity from Oracle
      </p>
    </div>
  )
}