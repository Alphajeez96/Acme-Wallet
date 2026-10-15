'use client'
import { useState } from 'react'
import type { Wallet } from '@/types/api'
import { Button, Card, Money, Skeleton } from '@/components/ui'
import styles from './BalanceSummary.module.css'

export function BalanceSummary({ wallets }: { wallets?: Wallet[] }) {
  const [hidden, setHidden] = useState(false)
  const total = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0)

  return (
    <Card className={styles.card}>
      <div>
        <p className={styles.label}>Total balance</p>
        <p className={styles.total}>
          {total === undefined ? (
            <Skeleton className={styles.balanceSkeleton} />
          ) : hidden ? (
            '••••••'
          ) : (
            <Money amount={total} currency="NGN" />
          )}
        </p>
      </div>
      <Button
        disabled={!wallets}
        variant="ghost"
        size="sm"
        iconLeft={hidden ? 'eye' : 'eye-off'}
        onClick={() => setHidden(!hidden)}
      >
        {hidden ? 'Show' : 'Hide'}
      </Button>
    </Card>
  )
}
