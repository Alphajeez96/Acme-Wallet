import { cx } from '@/lib/cx'
import styles from './TransactionStates.module.css'
import pageStyles from '@/app/transactions/page.module.css'
import { Button, Card, Icon, Skeleton } from '@/components/ui'

export const TransactionError = ({ onRetry }: { onRetry: () => void }) => (
  <div className={styles.state} role="alert">
    <span className={cx(styles.stateIcon, styles.errorIcon)}>
      <Icon name="alert" size={24} />
    </span>

    <div>
      <h2>We couldn’t load your transactions</h2>
      <p>Check your connection and try again.</p>
    </div>

    <Button iconLeft="refresh" onClick={onRetry}>
      Try again
    </Button>
  </div>
)

export const TransactionLoading = ({ count = 6, showDay = true }: { count?: number; showDay?: boolean }) => (
  <div aria-label="Loading transactions" role="status" className={styles.skeleton}>
    {showDay && (
      <div className={styles.day}>
        <Skeleton className={styles.skeletonDay} />
      </div>
    )}

    {Array.from({ length: count }, (_, index) => (
      <div key={index} className={styles.skeletonRow} aria-hidden="true">
        <Skeleton type="circle" size="lg" className={styles.skeletonAvatar} />
        <div className={styles.skeletonMain}>
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonNarration} />
        </div>
        <div className={styles.skeletonEnd}>
          <Skeleton className={styles.skeletonAmount} />
          <Skeleton className={styles.skeletonTime} />
        </div>
      </div>
    ))}
  </div>
)

export const TransactionEmpty = ({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) => (
  <div className={styles.state}>
    <span className={styles.stateIcon}>
      <Icon name={hasFilters ? 'search' : 'inbox'} size={24} />
    </span>

    <div>
      <h2>{hasFilters ? 'No transactions match your filters' : 'No transactions yet'}</h2>
      <p>
        {hasFilters
          ? 'Try a different search term or remove some filters.'
          : 'When you add money, send a transfer or pay with your card, it will show up here.'}
      </p>
    </div>

    {hasFilters && (
      <Button variant="secondary" onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </div>
)

export const TransactionPageLoading = () => (
  <div className={pageStyles.page} aria-busy="true">
    <header>
      <h1 className={pageStyles.title}>Transactions</h1>
      <p className={pageStyles.subtitle} aria-label="Loading transaction count">
        <Skeleton size="sm" className={pageStyles.subtitleSkeleton} />
      </p>
    </header>

    <div className={pageStyles.filters}>
      {['Search', 'Type', 'Status'].map((label) => (
        <div key={label} className={cx(styles.filterSkeleton, label === 'Search' && pageStyles.search)}>
          <span>{label}</span>
          <Skeleton type="rectangle" className={styles.controlSkeleton} />
        </div>
      ))}
    </div>
    <Card padding="none">
      <TransactionLoading />
    </Card>
  </div>
)
