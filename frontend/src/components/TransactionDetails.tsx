import ShareableReceipt from './ShareableReceipt'
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  CheckCircle2, Clock3, Copy, ReceiptText, X
} from 'lucide-react'
import type { TransactionItem } from '../lib/transactions'

interface Props {
  transaction: TransactionItem
  onClose: () => void
}

const money = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 2,
})

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-5 gap-y-1 border-b border-[#D9C5D1] py-3.5 last:border-0">
      <span className="text-xs text-[#786471]">{label}</span>
      <span className="break-all text-right text-xs font-semibold text-[#463740]">
        {value}
      </span>
    </div>
  )
}

function AccountParty({
  label,
  name,
  account,
}: {
  label: string
  name?: string | null
  account: string
}) {
  return (
    <div className="border-b border-[#D9C5D1] py-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#84697A]">
        {label}
      </p>
      <p className="text-sm font-semibold text-[#463740]">
        {name || 'Account holder unavailable'}
      </p>
      <p className="mt-1 text-xs text-[#765F6E]">
        {account}
      </p>
    </div>
  )
}
export default function TransactionDetails({ transaction, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeButton.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [onClose])

  const incoming = transaction.direction === 'INCOMING'
  const internal = transaction.direction === 'INTERNAL'
  const Icon = incoming
    ? ArrowDownLeft
    : internal
      ? ArrowLeftRight
      : ArrowUpRight

  const directionLabel = internal
    ? 'Internal transfer'
    : incoming
      ? 'Incoming transfer'
      : 'Outgoing transfer'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close transaction details"
        onClick={onClose}
        className="absolute inset-0 bg-[#342A34]/55"
      />

      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-detail-heading"
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 max-h-[90vh] w-full max-w-[475px] overflow-y-auto rounded-[28px] border border-[#D9C5D1] bg-[#F0E4EA] p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#7B5B70]">
            <ReceiptText size={17} />
            TRANSACTION RECEIPT
          </span>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="orv-button rounded-xl bg-[#E4CEDB] p-2 text-[#674B5D]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="rounded-[23px] bg-[#E8D8E2] p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6C9E8] text-[#6E5A87]">
            <Icon size={26} />
          </div>

          <p className="mb-2 text-xs text-[#786471]">{directionLabel}</p>
          <h2
            id="transaction-detail-heading"
            className="text-[30px] font-semibold tracking-[-0.055em] text-[#463740]"
          >
            {incoming ? '+' : internal ? '' : '−'}
            {money.format(transaction.amount)}
          </h2>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#DCEFE7] px-3 py-1.5 text-[11px] font-semibold text-[#477B5E]">
            {transaction.status === 'COMPLETED' && <CheckCircle2 size={14} />}
            {transaction.status}
          </span>
        </div>

        <div className="mt-5">
          <Row label="Transaction ID" value={`#${transaction.transactionId}`} />
          <Row label="Reference" value={transaction.reference} />
          <AccountParty
            label="From · Sender"
            name={transaction.fromAccountName}
            account={transaction.fromAccount}
          />
          <AccountParty
            label="To · Recipient"
            name={transaction.toAccountName}
            account={transaction.toAccount}
          />
          <Row label="Transaction type" value={transaction.transactionType} />
          <Row label="Direction" value={transaction.direction} />
          <Row label="Currency" value={transaction.currency} />
          <Row label="Created at" value={transaction.createdAt?.replace('T', ' ') ?? '—'} />
          <Row label="Completed at" value={transaction.completedAt?.replace('T', ' ') ?? '—'} />
        </div>

        <ShareableReceipt transaction={transaction} />

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#E4CEDB] p-4 text-xs leading-5 text-[#705468]">
          <Clock3 size={16} className="mt-0.5 shrink-0"/>
          Transaction timestamps are displayed as recorded by the backend.
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(transaction.reference)
                .catch(() => {})
            }
          }}
          className="orv-button mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#785467] px-5 py-3.5 text-sm font-semibold text-white"
        >
          <Copy size={16} />
          Copy transaction reference
        </motion.button>
      </motion.section>
    </div>
  )
}