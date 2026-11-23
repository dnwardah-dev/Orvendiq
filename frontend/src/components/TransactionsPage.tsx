import AnimatedHeading from './AnimatedHeading'
import { useEffect, useState } from 'react'
import TransactionDetails from './TransactionDetails'
import { motion } from 'motion/react'
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  ChevronLeft, ChevronRight, RefreshCw,
  Search, AlertCircle, ReceiptText
} from 'lucide-react'

import { useAuthToken } from '../context/AuthContext'
import {
  getTransactions,
  type TransactionItem,
  type TransactionPage
} from '../lib/transactions'

type DirectionFilter = 'ALL' | 'INCOMING' | 'OUTGOING' | 'INTERNAL'

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ')
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function LoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading transactions" className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="orv-skeleton h-[76px] rounded-2xl"
        />
      ))}
      <span className="sr-only">Loading transaction history</span>
    </div>
  )
}

export default function TransactionsPage() {
  const token = useAuthToken()

  const [page, setPage] = useState(0)
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<TransactionPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState<DirectionFilter>('ALL')
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getTransactions(token, page, 10, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setData(result)
        setError('')
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'Unable to load transactions.'
        )
        setData(null)
        setLoading(false)
      })

    return () => controller.abort()
  }, [token, page, version])

  const transactions = (data?.items ?? []).filter((item) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      item.reference.toLowerCase().includes(query) ||
      item.fromAccount.toLowerCase().includes(query) ||
      item.toAccount.toLowerCase().includes(query) ||
      String(item.transactionId).includes(query)

    const matchesDirection =
      direction === 'ALL' || item.direction === direction

    return matchesSearch && matchesDirection
  })

  function refresh() {
    setLoading(true)
    setVersion((current) => current + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#916D85]">
            Workspace / Transaction history
          </p>
          {/* ORVENDIQ_PAGE_WORD_REVEAL */}
<AnimatedHeading
  text="Your transactions"
  as="h1"
  className="text-[clamp(28px,3vw,39px)] font-semibold tracking-[-0.055em]"
>
  {' '}
  <span className="text-[#986F8C]">✳</span>
</AnimatedHeading>
          <p className="mt-2 text-[13px] text-[#75636F]">
            A thoughtful view of your financial activity.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={refresh}
          disabled={loading}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="orv-button flex items-center gap-2 rounded-2xl bg-[#D8B7CA] px-5 py-3 text-xs font-semibold text-[#463740] disabled:opacity-60"
        >
          <RefreshCw size={15}/>
          Refresh
        </motion.button>
      </div>

      <section className="orv-card rounded-[25px] border border-[#D9C5D1] bg-[#F0E4EA] p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-[#D8B7CA] p-3 text-[#68465C]">
            <ArrowLeftRight size={20}/>
          </div>
          <div>
            <h2 className="font-semibold">Transaction history</h2>
            <p className="mt-1 text-xs text-[#75636F]">
              Your account activity, retrieved securely.
            </p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#846779]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Reference, account or ID..."
              aria-label="Search transactions on current page"
              className="w-full rounded-2xl border border-[#D9C5D1] bg-[#E8D8E2] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#946C86]"
            />
          </div>

          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value as DirectionFilter)}
            aria-label="Filter transaction direction"
            className="rounded-2xl border border-[#D9C5D1] bg-[#E8D8E2] px-4 py-3 text-sm outline-none focus:border-[#946C86]"
          >
            <option value="ALL">All directions</option>
            <option value="INCOMING">Incoming</option>
            <option value="OUTGOING">Outgoing</option>
            <option value="INTERNAL">Internal</option>
          </select>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#75636F]">
          <span>
            {loading ? 'Loading activity...' : `${data?.totalElements ?? 0} total transactions`}
          </span>
          <span>Search and filters apply to this page</span>
        </div>

        {loading ? (
          <LoadingSkeleton/>
        ) : error ? (
          <div className="rounded-2xl bg-[#E8D8E2] p-6">
            <AlertCircle size={23} className="mb-3 text-[#95647D]"/>
            <p className="font-semibold">Unable to load history</p>
            <p role="alert" className="mt-2 text-sm text-[#75636F]">
              {error}
            </p>
            <button
              onClick={refresh}
              className="orv-button mt-4 rounded-xl bg-[#D8B7CA] px-4 py-2 text-xs font-semibold"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl bg-[#E8D8E2] p-8 text-center">
            <ReceiptText size={27} className="mx-auto mb-3 text-[#95647D]"/>
            <p className="font-semibold">No matching transactions</p>
            <p className="mt-2 text-xs text-[#75636F]">
              Try a different filter or another page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((item: TransactionItem) => {
              const incoming = item.direction === 'INCOMING'
              const internal = item.direction === 'INTERNAL'
              const Icon = incoming
                ? ArrowDownLeft
                : internal
                  ? ArrowLeftRight
                  : ArrowUpRight

              return (
                <div
                  key={item.transactionId}
                  className="orv-card flex flex-wrap items-center gap-4 rounded-2xl bg-[#E8D8E2] p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D8B7CA] text-[#68465C]">
                    <Icon size={19}/>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {internal ? 'Internal transfer' : incoming ? 'Money received' : 'Money sent'}
                    </p>
                    <p className="mt-1 break-all text-[11px] text-[#75636F]">
                      {item.reference}
                    </p>
                    <p className="mt-1 text-[11px] text-[#75636F]">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {incoming ? '+' : internal ? '' : '−'}
                      {currency.format(item.amount)}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-[#D6C9E8] px-3 py-1 text-[10px] font-semibold text-[#594C6D]">
                      {item.status}
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-between gap-3 border-t border-[#D9C5D1] pt-3 text-[11px] text-[#75636F]">
                    <span className="break-all">{item.fromAccount} → {item.toAccount}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(item)}
                      className="orv-button shrink-0 rounded-xl bg-[#D8B7CA] px-3 py-2 text-[11px] font-semibold text-[#60475A]"
                    >
                      View details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-6 flex items-center justify-between border-t border-[#D9C5D1] pt-5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => {
                setLoading(true)
                setPage((current) => current - 1)
              }}
              className="orv-button flex items-center gap-1 rounded-xl bg-[#D8B7CA] px-3 py-2 text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft size={15}/> Previous
            </button>
            <span className="text-xs text-[#75636F]">
              Page {page + 1} of {Math.max(1, data.totalPages)}
            </span>
            <button
              type="button"
              disabled={page + 1 >= data.totalPages}
              onClick={() => {
                setLoading(true)
                setPage((current) => current + 1)
              }}
              className="orv-button flex items-center gap-1 rounded-xl bg-[#D8B7CA] px-3 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Next <ChevronRight size={15}/>
            </button>
          </div>
        )}
      </section>
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </motion.div>
  )
}