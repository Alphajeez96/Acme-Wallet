'use client'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import type { Wallet } from '@/types/api'
import { Button, Card, Icon, Money, Skeleton } from '@/components/ui'
import styles from './BalanceSummary.module.css'

export function BalanceSummary({ wallets }: { wallets?: Wallet[] }) {
  const [hidden, setHidden] = useState(false)
  const reducedMotion = useReducedMotion()
  const transition = { duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] as const }
  const total = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0)

  return (
    <Card className={styles.card}>
      <div>
        <p className={styles.label}>Total balance</p>
        <p className={styles.total}>
          {total === undefined ? (
            <Skeleton className={styles.balanceSkeleton} />
          ) : (
            <span className={styles.balanceViewport}>
              <motion.span
                className={styles.balanceTrack}
                initial={false}
                animate={{ y: hidden ? '-50%' : 0 }}
                transition={transition}
              >
                <span aria-hidden={hidden}>
                  <Money amount={total} currency="NGN" />
                </span>
                <span aria-hidden={!hidden}>••••••</span>
              </motion.span>
            </span>
          )}
        </p>
      </div>
      <Button
        disabled={!wallets}
        variant="ghost"
        size="sm"
        aria-label={hidden ? 'Show balance' : 'Hide balance'}
        aria-pressed={hidden}
        onClick={() => setHidden(!hidden)}
      >
        <span className={styles.toggleViewport} aria-hidden="true">
          <motion.span
            className={styles.toggleTrack}
            initial={false}
            animate={{ y: hidden ? '-50%' : 0 }}
            transition={transition}
          >
            <span className={styles.toggleState}>
              <Icon name="eye-off" size={16} />
              Hide
            </span>
            <span className={styles.toggleState}>
              <Icon name="eye" size={16} />
              Show
            </span>
          </motion.span>
        </span>
      </Button>
    </Card>
  )
}
