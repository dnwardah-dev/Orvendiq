import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Wallet } from 'lucide-react'
import { useAuthToken } from '../context/AuthContext'

interface BalanceData {
  accountNumber: string
  ownerName: string
  currency: string
  balance: number
}

const ACCOUNT_NUMBER = 'ORV10000001'

export default function LiveBalanceCard() {
  const token = useAuthToken()
  const [data, setData] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadBalance() {
      setLoading(true)
      setError('')
      setData(null)

      try {
        const response = await fetch(
          `/api/v1/accounts/${ACCOUNT_NUMBER}/balance`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Your session has expired.'
              : response.status === 403
                ? 'You cannot access this account.'
                : `Failed to load balance (HTTP ${response.status}).`
          )
        }

        const result: BalanceData = await response.json()

        if (!controller.signal.aborted) {
          setData(result)
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Unable to load account balance.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadBalance()

    return () => controller.abort()
  }, [token, version])

  const formattedBalance = data
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: data.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(data.balance)
    : '—'

  return (
    <div className="orv-card rounded-[25px] bg-[#D8B7CA] p-6 md:p-7">
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-2xl bg-white/50 p-3 text-[#785467]">
          <Wallet size={21} />
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh account balance"
          title="Refresh account balance"
          className="orv-button rounded-xl p-2 text-[#785467] disabled:opacity-50"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <p className="text-[12px] text-[#785467]">
        Available balance
      </p>

      {loading ? (
        <div
          role="status"
          aria-label="Loading account balance"
          className="orv-skeleton mt-3 h-10 w-44 rounded-xl"
        />
      ) : error ? (
        <div>
          <p className="mt-2 text-sm font-semibold text-[#8D4659]">
            Balance unavailable
          </p>
          <p role="alert" className="mt-2 text-xs text-[#8D4659]">
            {error}
          </p>
        </div>
      ) : (
        <h2 className="mt-2 text-[clamp(24px,2.3vw,33px)] font-semibold tracking-[-0.05em] text-[#463740]">
          {formattedBalance}
        </h2>
      )}

      <p className="mt-4 text-[11px] text-[#785467]">
        {data
          ? `${data.ownerName} · ${data.accountNumber}`
          : 'Secure account data from Oracle'}
      </p>
    </div>
  )
}