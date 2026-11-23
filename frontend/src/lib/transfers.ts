export interface TransferPayload {
  fromAccount: string
  toAccount: string
  amount: string
  reference: string
}

export interface TransferResult {
  transactionId: number
  reference: string
  amount: number
  status: string
}

export function createTransferReference(): string {
  return `ORV-${crypto.randomUUID()}`
}

export async function createTransfer(
  token: string,
  payload: TransferPayload
): Promise<TransferResult> {
  const from = payload.fromAccount.trim()
  const to = payload.toAccount.trim()
  const amount = payload.amount.trim()

  if (!from || !to) {
    throw new Error('Sender and recipient accounts are required.')
  }

  if (from === to) {
    throw new Error('Sender and recipient must be different.')
  }

  if (!/^\d{1,17}(\.\d{1,2})?$/.test(amount)) {
    throw new Error('Enter a valid amount with up to two decimals.')
  }

  const parsedAmount = Number(amount)

  if (
    !Number.isFinite(parsedAmount) ||
    parsedAmount < 0.01 ||
    parsedAmount > 1_000_000_000
  ) {
    throw new Error('Amount must be between 0.01 and 1 billion.')
  }

  if (!payload.reference || payload.reference.length > 50) {
    throw new Error('Invalid transaction reference.')
  }

  const response = await fetch('/api/v1/transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fromAccount: from,
      toAccount: to,
      amount: parsedAmount,
      reference: payload.reference,
    }),
    cache: 'no-store',
  })

  if (response.status === 401) {
    throw new Error('Your session expired. Please sign in again.')
  }

  if (response.status === 403) {
    throw new Error('You are not authorized to use this account.')
  }

  if (response.status === 409) {
    throw new Error('This transaction reference already exists.')
  }

  if (response.status === 422) {
    throw new Error('Transfer rejected. Check your available balance.')
  }

  if (response.status === 400) {
    throw new Error('Invalid transfer details.')
  }

  if (!response.ok) {
    throw new Error(
      `Transfer failed (HTTP ${response.status}).`
    )
  }

  return response.json() as Promise<TransferResult>
}