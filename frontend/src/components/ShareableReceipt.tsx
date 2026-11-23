import { useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { Download, Share2, CheckCircle2, Flower2 } from 'lucide-react'
import type { TransactionItem } from '../lib/transactions'

interface Props {
  transaction: TransactionItem
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 2,
})



function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderBottom: '1px solid #D9C5D1',
        fontSize: 12,
      }}
    >
      <span style={{ color: '#826D7B' }}>{label}</span>
      <span
        style={{
          color: '#463740',
          fontWeight: 600,
          textAlign: 'right',
          overflowWrap: 'anywhere',
          maxWidth: '65%',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function PartyBlock({
  label,
  name,
  account,
}: {
  label: string
  name?: string | null
  account: string
}) {
  return (
    <div
      style={{
        padding: '17px 0',
        borderBottom: '1px solid #D9C5D1',
      }}
    >
      <div
        style={{
          color: '#826D7B',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 9,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#463740',
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 5,
        }}
      >
        {name || 'Account holder unavailable'}
      </div>

      <div
        style={{
          color: '#715A69',
          fontSize: 12,
        }}
      >
        {account}
      </div>
    </div>
  )
}
function formatTransferDateTime(value: string) {
  // Backend returns LocalDateTime without a timezone.
  // Preserve the recorded clock time rather than converting it.
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  )

  if (!match) {
    return {
      date: value,
      time: 'Unavailable',
    }
  }

  const [, year, month, day, hour, minute, second] = match

  const months = [
    'Januari', 'Februari', 'Maret', 'April',
    'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'
  ]

  const monthName = months[Number(month) - 1]

  return {
    date: `${Number(day)} ${monthName} ${year}`,
    time: `${hour}:${minute}:${second ?? '00'}`,
  }
}
export default function ShareableReceipt({ transaction }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const filename = `orvendiq-demo-receipt-${transaction.transactionId}.png`

  async function generateImage(): Promise<Blob> {
    if (!receiptRef.current) {
      throw new Error('Receipt belum siap.')
    }

    const blob = await toBlob(receiptRef.current, {
      pixelRatio: 2,
      backgroundColor: '#F0E4EA',
      cacheBust: true,
    })

    if (!blob) {
      throw new Error('Gagal menghasilkan gambar receipt.')
    }

    return blob
  }

  function saveImage(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function download() {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const blob = await generateImage()
      saveImage(blob)
      setMessage('PNG berhasil dibuat.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Gagal mengunduh bukti transfer.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const blob = await generateImage()
      const file = new File([blob], filename, {
        type: 'image/png',
      })

      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'Orvendiq Demo Transfer Receipt',
          text: 'Simulated transaction receipt from Orvendiq.',
        })
      } else {
        saveImage(blob)
        setMessage('Sharing tidak didukung. PNG sudah diunduh.')
      }
    } catch (reason) {
      if (
        reason instanceof DOMException &&
        reason.name === 'AbortError'
      ) {
        return
      }

      setError(
        'Gagal membagikan gambar. Gunakan Download PNG sebagai alternatif.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#463740]">
          Shareable receipt
        </h3>
        <span className="rounded-full bg-[#D8B7CA] px-3 py-1 text-[10px] font-semibold text-[#694A5D]">
          DEMO
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <div
          ref={receiptRef}
          style={{
            width: 390,
            boxSizing: 'border-box',
            padding: 26,
            backgroundColor: '#F0E4EA',
            color: '#463740',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#D8B7CA',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flower2 size={20} color="#694A5D" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>
                orvendiq.
              </span>
            </div>
            <span style={{ color: '#946C86', fontSize: 10, fontWeight: 700 }}>
              DEMO
            </span>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '32px 0 25px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  backgroundColor: '#DCEFE7',
                }}
              >
                <CheckCircle2 size={26} color="#477B5E" />
              </div>
            </div>
            <p style={{ color: '#806C79', fontSize: 12, margin: '0 0 10px' }}>
              {transaction.transactionType === 'FUNDING'
                ? 'Funding transaction'
                : 'Transfer transaction'}
            </p>
            <div style={{ fontSize: 34, fontWeight: 750, letterSpacing: -1.5 }}>
              {rupiah.format(transaction.amount)}
            </div>
            <div
              style={{
                marginTop: 12,
                color: '#477B5E',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {transaction.status}
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #C9B1C0' }}>
            <Detail label="Transaction ID" value={`#${transaction.transactionId}`} />
            <PartyBlock
              label="FROM · SENDER"
              name={transaction.fromAccountName}
              account={transaction.fromAccount}
            />
            <PartyBlock
              label="TO · RECIPIENT"
              name={transaction.toAccountName}
              account={transaction.toAccount}
            />
            <Detail label="Direction" value={transaction.direction} />
            <Detail label="Currency" value={transaction.currency} />
                        <Detail
              label="Transfer date"
              value={formatTransferDateTime(
                transaction.completedAt || transaction.createdAt
              ).date}
            />
            <Detail
              label="Transfer time"
              value={formatTransferDateTime(
                transaction.completedAt || transaction.createdAt
              ).time}
            />
            <Detail label="Reference" value={transaction.reference} />
          </div>

          <div
            style={{
              marginTop: 24,
              padding: '12px',
              backgroundColor: '#E4CEDB',
              borderRadius: 12,
              textAlign: 'center',
              color: '#704D64',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            SIMULATED TRANSACTION
            <div>NOT VALID PROOF OF PAYMENT</div>
          </div>

          <div
            style={{
              marginTop: 17,
              textAlign: 'center',
              fontSize: 10,
              color: '#826D7B',
            }}
          >
            Orvendiq Financial Intelligence Studio
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="orv-button flex items-center justify-center gap-2 rounded-2xl bg-[#785467] px-4 py-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          <Download size={16}/>
          {busy ? 'Processing...' : 'Download PNG'}
        </button>

        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="orv-button flex items-center justify-center gap-2 rounded-2xl border border-[#C9B1C0] bg-[#E8D8E2] px-4 py-3 text-xs font-semibold text-[#694A5D] disabled:opacity-60"
        >
          <Share2 size={16}/>
          Share receipt
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#A34B63]">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-xs text-[#477B5E]">
          {message}
        </p>
      )}

      <p className="text-[11px] leading-5 text-[#806C79]">
        Account numbers are partially masked in the shared image.
        This receipt represents a simulated Orvendiq transaction.
      </p>
    </div>
  )
}