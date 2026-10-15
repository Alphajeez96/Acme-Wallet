import { TransactionPageLoading } from '@/components/transactions/TransactionStates'
import styles from './page.module.css'
import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'

export const metadata: Metadata = { title: 'Transactions' }

const TransactionsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.transparentScrollbar}>
      <Suspense fallback={<TransactionPageLoading />}>{children}</Suspense>
    </div>
  )
}

export default TransactionsLayout
