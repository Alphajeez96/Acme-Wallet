'use client'
import { useEffect, useState } from 'react'
import { CURRENCIES, type User } from '@/types/api'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { Skeleton } from '@/components/ui'
import { getMe } from '@/lib/api/endpoints'
import styles from './page.module.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className={styles.page} aria-busy={isLoading}>
      <header>
        <h1 className={styles.title}>
          Welcome back, {isLoading ? <Skeleton className={styles.nameSkeleton} /> : user!.firstName}
        </h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user?.wallets} />

      <div className={styles.wallets}>
        {isLoading
          ? CURRENCIES.map((currency) => <WalletCard key={currency} currency={currency} />)
          : user!.wallets.map((wallet) => (
              <WalletCard key={wallet.currency} currency={wallet.currency} wallet={wallet} />
            ))}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
