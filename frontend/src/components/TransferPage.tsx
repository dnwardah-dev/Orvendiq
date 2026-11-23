import AnimatedHeading from './AnimatedHeading'
import TransferSuccessReceipt from './TransferSuccessReceipt'
import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeft, ArrowRight,
  LockKeyhole, ShieldCheck, Wallet
} from 'lucide-react'
import { useAuthToken } from '../context/AuthContext'
import {
  createTransfer,
  createTransferReference,
  type TransferResult
} from '../lib/transfers'

type Step = 'form' | 'review' | 'success' | 'uncertain'

const money = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 2,
})

export default function TransferPage() {
  const token = useAuthToken()
  const [step, setStep] = useState<Step>('form')
  const [from, setFrom] = useState('ORV10000001')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [result, setResult] = useState<TransferResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const sender = from.trim()
    const recipient = to.trim()
    const cleaned = amount.trim()
    const numeric = Number(cleaned)

    if (!sender || !recipient) {
      setError('Sender and recipient accounts are required.')
      return
    }

    if (sender === recipient) {
      setError('Sender and recipient must be different.')
      return
    }

    if (
      !/^\d{1,17}(\.\d{1,2})?$/.test(cleaned) ||
      !Number.isFinite(numeric) ||
      numeric < 0.01 ||
      numeric > 1_000_000_000
    ) {
      setError('Enter a valid amount, for example 1000 or 1000.50.')
      return
    }

    setReference(createTransferReference())
    setStep('review')
  }

  async function confirm() {
    if (loading || !reference) return

    setLoading(true)
    setError('')

    try {
      const response = await createTransfer(token, {
        fromAccount: from.trim(),
        toAccount: to.trim(),
        amount: amount.trim(),
        reference,
      })

      setResult(response)
      setStep('success')
    } catch (reason) {
      const message = reason instanceof Error
        ? reason.message
        : 'Unable to complete transfer.'

      setError(message)

      // A network error or HTTP 5xx may leave the outcome unknown.
      // Do not automatically submit the same transfer again.
      if (
        message.startsWith('Transfer failed (HTTP 5') ||
        message === 'Unable to complete transfer.' ||
        reason instanceof TypeError
      ) {
        setStep('uncertain')
      }
    } finally {
      setLoading(false)
    }
  }

  function edit() {
    setStep('form')
    setReference('')
    setError('')
  }

  function reset() {
    setStep('form')
    setTo('')
    setAmount('')
    setReference('')
    setResult(null)
    setError('')
  }

  const fieldStyle =
    'w-full rounded-2xl border border-[#D9C5D1] bg-[#E8D8E2] px-4 py-3.5 text-sm text-[#463740] outline-none focus:border-[#946C86] focus:ring-2 focus:ring-[#D8B7CA]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-[850px] space-y-6"
    >
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#916D85]">
          Workspace / Money transfer
        </p>
        {/* ORVENDIQ_PAGE_WORD_REVEAL */}
<AnimatedHeading
  text="Send money"
  as="h1"
  className="text-[clamp(28px,3vw,39px)] font-semibold tracking-[-0.055em]"
>
  {' '}
  <span className="text-[#986F8C]">✳</span>
</AnimatedHeading>
        <p className="mt-2 text-[13px] text-[#75636F]">
          A thoughtful way to move funds between demo accounts.
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold text-[#76596C]">
        {['Details', 'Review', 'Result'].map((label, index) => {
          const active = step === 'form'
            ? index === 0
            : step === 'review'
              ? index === 1
              : index === 2

          return (
            <div
              key={label}
              className={`flex flex-1 items-center justify-center rounded-xl px-2 py-3 ${
                active ? 'bg-[#D8B7CA]' : 'bg-[#F0E4EA]'
              }`}
            >
              {index + 1}. {label}
            </div>
          )
        })}
      </div>

      <section className="rounded-[26px] border border-[#D9C5D1] bg-[#F0E4EA] p-6 sm:p-9">
        {step === 'form' && (
          <form onSubmit={review} className="space-y-5">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-2xl bg-[#D8B7CA] p-3 text-[#68465C]">
                <Wallet size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Transfer details</h2>
                <p className="text-xs text-[#806C79]">
                  Double-check the account numbers before continuing.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="transfer-from" className="mb-2 block text-xs font-semibold">
                From account
              </label>
              <input
                id="transfer-from"
                className={fieldStyle}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                required
                maxLength={50}
              />
              <p className="mt-2 text-[11px] text-[#806C79]">
                Only accounts you own can be used to send money.
              </p>
            </div>

            <div>
              <label htmlFor="transfer-to" className="mb-2 block text-xs font-semibold">
                Recipient account
              </label>
              <input
                id="transfer-to"
                className={fieldStyle}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="e.g. ORV10000002"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="transfer-amount" className="mb-2 block text-xs font-semibold">
                Amount (IDR)
              </label>
              <input
                id="transfer-amount"
                className={fieldStyle}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 1000"
                inputMode="decimal"
                required
              />
              <p className="mt-2 text-[11px] text-[#806C79]">
                Use digits without thousands separators. Example: 1000.50
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-[#F5D5DE] p-4 text-xs text-[#923F5D]">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="orv-button flex w-full items-center justify-center gap-2 rounded-2xl bg-[#785467] p-4 text-sm font-semibold text-white"
            >
              Review transfer <ArrowRight size={17} />
            </motion.button>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#D6C9E8] p-3 text-[#625478]">
                <ShieldCheck size={22}/>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Review your transfer</h2>
                <p className="text-xs text-[#806C79]">
                  This confirmation will submit a real request to your demo ledger.
                </p>
              </div>
            </div>

            <div className="rounded-[23px] bg-[#E8D8E2] p-6">
              <p className="text-center text-xs text-[#806C79]">Transfer amount</p>
              <p className="my-4 text-center text-3xl font-semibold tracking-[-0.05em]">
                {money.format(Number(amount))}
              </p>

              <div className="space-y-3 border-t border-[#CDB7C5] pt-5 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#806C79]">From</span>
                  <strong>{from.trim()}</strong>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#806C79]">To</span>
                  <strong>{to.trim()}</strong>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#806C79]">Currency</span>
                  <strong>IDR</strong>
                </div>
              </div>
            </div>

            <p className="rounded-xl bg-[#E4CEDB] p-4 text-xs leading-5 text-[#6F5063]">
              Recipient name has not been verified in this step.
              Confirm the recipient account number carefully.
              This action changes the balance in your demo database.
            </p>

            {error && (
              <p role="alert" className="rounded-xl bg-[#F5D5DE] p-4 text-xs text-[#923F5D]">
                {error}
              </p>
            )}

            {loading && (
              <div role="status" aria-label="Submitting transfer" className="space-y-2">
                <div className="orv-skeleton h-3 w-40 rounded-lg"/>
                <div className="orv-skeleton h-11 rounded-xl"/>
                <span className="sr-only">Processing transfer</span>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={edit}
                disabled={loading}
                className="orv-button flex items-center justify-center gap-2 rounded-2xl bg-[#E4CEDB] p-4 text-sm font-semibold disabled:opacity-50"
              >
                <ArrowLeft size={17}/> Edit details
              </button>

              <motion.button
                type="button"
                onClick={confirm}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="orv-button flex items-center justify-center gap-2 rounded-2xl bg-[#785467] p-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                <LockKeyhole size={16}/>
                {loading ? 'Processing...' : 'Confirm transfer'}
              </motion.button>
            </div>
          </div>
        )}

        {step === 'success' && result && (
          <TransferSuccessReceipt
            result={result}
            onNewTransfer={reset}
          />
        )}
        {step === 'uncertain' && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Transfer status uncertain</h2>
            <p role="alert" className="text-sm leading-6 text-[#745A6A]">
              We could not confirm the result. The backend may have
              processed this request. Do not submit it again until
              you check your transaction history.
            </p>
            <p className="break-all rounded-xl bg-[#E8D8E2] p-4 text-xs">
              Reference: {reference}
            </p>
            <p className="text-xs text-[#806C79]">
              Use the Transactions menu to check this reference.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-[#806C79]">
        Orvendiq uses simulated funds. This is not a real banking service.
      </p>
    </motion.div>
  )
}