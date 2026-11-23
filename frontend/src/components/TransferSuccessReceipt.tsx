import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Send } from 'lucide-react'
import { getTransactions, type TransactionItem } from '../lib/transactions'
import type { TransferResult } from '../lib/transfers'
import { useAuthToken } from '../context/AuthContext'
import ShareableReceipt from './ShareableReceipt'

interface Props {
  result: TransferResult
  onNewTransfer: () => void
}

export default function TransferSuccessReceipt({
  result,
  onNewTransfer,
}: Props) {
  const token = useAuthToken()
  const [receipt, setReceipt] = useState<TransactionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      setReceipt(null)

      try {
        // Read confirmed transaction data from Oracle via Spring Boot.
        // A successful POST alone is not used to fabricate a receipt.
        const history = await getTransactions(
          token, 0, 50, controller.signal
        )

        const saved = history.items.find(
          (item) =>
            item.transactionId === result.transactionId &&
            item.reference === result.reference &&
            item.status === 'COMPLETED'
        )

        if (!saved) {
          throw new Error(
            'Receipt belum ditemukan pada 50 transaksi terbaru. ' +
            'Periksa menu Transactions.'
          )
        }

        if (!controller.signal.aborted) {
          setReceipt(saved)
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Gagal mengambil bukti transfer.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [result.transactionId, result.reference, token, version])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DCEFE7] text-[#477B5E]">
          <CheckCircle2 size={29} />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Transfer completed!
          </h2>
          <p className="mt-1 text-xs text-[#806C79]">
            Transaction #{result.transactionId} · Confirmed by Spring Boot
          </p>
        </div>
      </div>

      {loading ? (
        <div role="status" className="space-y-4">
          <div className="orv-skeleton h-16 rounded-2xl" />
          <div className="orv-skeleton h-80 rounded-2xl" />
          <div className="orv-skeleton h-12 rounded-2xl" />
          <span className="sr-only">Loading transfer receipt</span>
        </div>
      ) : receipt ? (
        <ShareableReceipt transaction={receipt} />
      ) : (
        <div className="rounded-2xl bg-[#E8D8E2] p-5">
          <p className="text-sm font-semibold">
            Transfer berhasil, tetapi receipt belum tersedia.
          </p>
          <p role="alert" className="mt-2 text-xs text-[#806C79]">
            {error}
          </p>
          <p className="mt-3 break-all text-xs text-[#806C79]">
            Reference: {result.reference}
          </p>
          <button
            type="button"
            onClick={() => setVersion((value) => value + 1)}
            className="orv-button mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D8B7CA] px-4 py-3 text-xs font-semibold"
          >
            <RefreshCw size={15} />
            Load receipt again
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onNewTransfer}
        className="orv-button flex w-full items-center justify-center gap-2 rounded-2xl bg-[#785467] p-4 text-sm font-semibold text-white"
      >
        <Send size={16} />
        New transfer
      </button>
    </div>
  )
}