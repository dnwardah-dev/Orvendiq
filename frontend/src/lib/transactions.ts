export interface TransactionItem {
  transactionId: number
  reference: string
  fromAccount: string
  fromAccountName?: string | null
  toAccount: string
  toAccountName?: string | null
  amount: number
  currency: string
  status: string
  transactionType: string
  direction: 'INCOMING' | 'OUTGOING' | 'INTERNAL'
  createdAt: string
  completedAt: string | null
}

export interface TransactionPage {
  items: TransactionItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export async function getTransactions(
  token: string,
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<TransactionPage> {
  const response = await fetch(
    `/api/v1/transactions?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: 'no-store',
    }
  )

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.')
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to view transactions.')
  }

  if (!response.ok) {
    throw new Error(`Unable to load transactions (HTTP ${response.status}).`)
  }

  return response.json() as Promise<TransactionPage>
}