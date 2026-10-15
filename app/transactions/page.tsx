import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Button, Card, Icon, Input, Select, type BadgeTone, type IconName } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatMoney, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_GROUPS } from '@/components/transactions/static-data'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Transactions' }

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'successful', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'reversed', label: 'Reversed' },
]
const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_in: 'arrow-down-left',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}
const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}
const CREDIT_TYPES: TransactionType[] = ['deposit', 'transfer_in', 'conversion']

export default function TransactionsPage() {
  return (
    <div>
      <nav className={styles.mobileNavigation} aria-label="Main">
        <Link href="/">Dashboard</Link>
        <Link href="/transactions" className={styles.activeLink} aria-current="page">
          Transactions
        </Link>
        <Link href="/convert">Convert</Link>
      </nav>
      <div className={styles.page}>
        <header>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>237 transactions</p>
        </header>
        <div className={styles.filters}>
          <Input
            label="Search"
            leadingIcon="search"
            placeholder="Search by reference, name or narration"
            fieldClassName={styles.desktopSearch}
          />
          <Input
            label="Search"
            leadingIcon="search"
            placeholder="Search reference, name…"
            fieldClassName={styles.mobileSearch}
          />
          <Select label="Type" options={TYPE_OPTIONS} defaultValue="" />
          <Select label="Status" options={STATUS_OPTIONS} defaultValue="" />
        </div>
        <Card padding="none">
          {TRANSACTION_GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className={styles.day}>{group.label}</h2>
              {group.transactions.map((tx) => {
                const credit = CREDIT_TYPES.includes(tx.type)
                const status = (
                  <Badge tone={STATUS_TONES[tx.status]} dot>
                    {TRANSACTION_STATUS_LABELS[tx.status]}
                  </Badge>
                )
                return (
                  <div
                    key={tx.narration}
                    className={cx(styles.row, tx.initials === 'AO' && styles.highlighted)}
                  >
                    <span className={styles.avatar}>
                      {tx.initials ?? <Icon name={TYPE_ICONS[tx.type]} size={18} />}
                    </span>
                    <div className={styles.main}>
                      <p className={styles.transactionTitle}>{TRANSACTION_TYPE_LABELS[tx.type]}</p>
                      <p className={styles.narration} title={tx.narration}>
                        {tx.narration}
                      </p>
                    </div>
                    <div className={styles.status}>{status}</div>
                    <div className={styles.end}>
                      <p className={cx(styles.amount, credit && styles.credit)}>
                        {credit ? '+' : '−'}
                        {formatMoney(tx.amount, tx.currency)}
                      </p>
                      <p className={styles.time}>{tx.time}</p>
                      <div className={styles.mobileStatus}>{status}</div>
                    </div>
                  </div>
                )
              })}
            </section>
          ))}
        </Card>
        <nav className={styles.pagination} aria-label="Transaction pages">
          <p className={styles.desktopSummary}>Showing 1–20 of 237</p>
          <div className={styles.pages}>
            <Button
              variant="secondary"
              size="sm"
              disabled
              iconLeft="chevron-left"
              className={styles.paginationButton}
            >
              Previous
            </Button>
            <span className={styles.currentPage} aria-current="page">
              1
            </span>
            <span className={styles.pageNumber}>2</span>
            <span className={styles.pageNumber}>3</span>
            <span className={styles.ellipsis}>…</span>
            <span className={styles.pageNumber}>12</span>
            <Button
              variant="secondary"
              size="sm"
              iconRight="chevron-right"
              className={styles.paginationButton}
            >
              Next
            </Button>
          </div>
          <div className={styles.mobilePages}>
            <Button variant="secondary" size="sm" disabled iconLeft="chevron-left">
              Prev
            </Button>
            <p>Page 1 of 12</p>
            <Button variant="secondary" size="sm" iconRight="chevron-right">
              Next
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}
