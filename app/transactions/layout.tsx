import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'

export const metadata: Metadata = { title: 'Transactions' }

const TransactionsLayout = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
}

export default TransactionsLayout
