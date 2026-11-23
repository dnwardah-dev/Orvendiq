import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { useAuthToken } from '../context/AuthContext'
import {
  getTransactions,
  type TransactionItem,
} from '../lib/transactions'

interface Props {
  onViewAll: () => void
}

const DEMO_ACCOUNT = 'ORV10000001'

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency || 'IDR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatTimestamp(value: string) {
  const match = value?.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  )

  if (!match) return value || 'Date unavailable'

  const [, year, month, day, hour, minute] = match

  return `${day}/${month}/${year} · ${hour}:${minute}`
}

function ActivityRow({ item }: { item: TransactionItem }) {
  const direction = item.direction?.toUpperCase()

  const incoming =
    direction === 'INCOMING' ||
    (direction !== 'OUTGOING' &&
      item.toAccount === DEMO_ACCOUNT)

  const person = incoming
    ? item.fromAccountName || item.fromAccount
    : item.toAccountName || item.toAccount

  const date = item.completedAt || item.createdAt

  return (
    <div className="orv-card flex items-center gap-3 rounded-2xl px-3 py-4 transition-colors hover:bg-[#FCF9FB]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          incoming
            ? 'bg-[#DFF1E8] text-[#538A70]'
            : 'bg-[#FCE9DE] text-[#B47753]'
        }`}
      >
        {incoming
          ? <ArrowDownLeft size={18} />
          : <ArrowUpRight size={18} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-[#463740]">
          {incoming ? `Received from ${person}` : `Transfer to ${person}`}
        </p>
        <p className="mt-1 text-[11px] text-[#A096A0]">
          #{item.transactionId} · {formatTimestamp(date)}
        </p>
        <p className="mt-1 text-[10px] text-[#887786]">
          {item.status}
        </p>
      </div>

      <span className="shrink-0 text-right text-[12px] font-semibold text-[#463740]">
        {incoming ? '+' : '−'}
        {formatMoney(item.amount, item.currency)}
      </span>
    </div>
  )
}

export default function LiveRecentActivity({
  onViewAll,
}: Props) {
  const token = useAuthToken()
  const [items, setItems] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError('')

    getTransactions(token, 0, 5, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setItems(response.items)
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setItems([])
          setError(
            reason instanceof Error
              ? reason.message
              : 'Unable to load recent activity.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [token, version])

  return (
    <section className="rounded-[25px] border border-[#EADFE6] bg-[#F0E4EA] p-6 sm:p-7">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.025em]">
            Recent activity
          </h3>
          <p className="mt-1 text-[11px] text-[#A096A0]">
            Your latest account movements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVersion((v) => v + 1)}
            disabled={loading}
            aria-label="Refresh recent activity"
            className="orv-button rounded-lg p-2 text-[#966D8C] disabled:opacity-50"
          >
            <RefreshCw size={15} />
          </button>

          <button
            type="button"
            onClick={onViewAll}
            className="orv-button flex items-center gap-1 text-[11px] font-semibold text-[#966D8C]"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="orv-skeleton h-20 rounded-2xl"
            />
          ))
        ) : error ? (
          <p role="alert" className="text-xs text-[#9B5364]">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#A096A0]">
            No transactions yet.
          </p>
        ) : (
          items.map((item) => (
            <ActivityRow
              key={item.transactionId}
              item={item}
            />
          ))
        )}
      </div>
    </section>
  )
}