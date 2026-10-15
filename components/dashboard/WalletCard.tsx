import type { Currency, Wallet } from '@/types/api'
import { cx } from '@/lib/cx'
import { Money, Skeleton } from '@/components/ui'
import styles from './WalletCard.module.css'

export function WalletCard({ wallet, currency }: { wallet?: Wallet; currency: Currency }) {
  return (
    <article className={cx(styles.card, styles[currency])}>
      <p className={styles.label}>{currency} wallet</p>
      <p className={styles.balance}>
        {wallet ? (
          <Money amount={wallet.balance} currency={currency} />
        ) : (
          <Skeleton className={styles.balanceSkeleton} />
        )}
      </p>
    </article>
  )
}
