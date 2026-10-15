import { TransactionPageLoading } from '@/components/transactions/TransactionStates'
import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'

export const metadata: Metadata = { title: 'Transactions' }

const TransactionsLayout = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<TransactionPageLoading />}>{children}</Suspense>
}

export default TransactionsLayout
