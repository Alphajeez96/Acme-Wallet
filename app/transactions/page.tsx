'use client'
import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { getTransactions, type TransactionQuery } from '@/lib/api/endpoints'
import { useRouter, useSearchParams } from 'next/navigation'
import { TransactionPagination } from '@/components/transactions/TransactionPagination'
import { formatMoney, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { Badge, Card, Icon, Input, Select, Skeleton, type BadgeTone, type IconName } from '@/components/ui'
import {
  groupTransactions,
  transactionInitials,
  formatTransactionTime,
} from '@/components/transactions/format'
import {
  TransactionEmpty,
  TransactionError,
  TransactionLoading,
} from '@/components/transactions/TransactionStates'

import styles from './page.module.css'

import buttonStyles from '@/components/ui/Button/Button.module.css'
import type { TransactionStatus, TransactionType } from '@/types/api'

type TransactionSearchKey = keyof Pick<TransactionQuery, 'page' | 'type' | 'status' | 'q'>

const TRANSACTION_SEARCH_PARAMS = {
  page: 'page',
  type: 'type',
  status: 'status',
  q: 'q',
} as const satisfies { [Key in TransactionSearchKey]: Key }

type TransactionSearchUpdates = Partial<Record<TransactionSearchKey, string>>

const queryHref = (query: string, updates: TransactionSearchUpdates) => {
  const params = new URLSearchParams(query)
  for (const [key, value] of Object.entries(updates)) {
    if (value && !(key === TRANSACTION_SEARCH_PARAMS.page && value === '1')) params.set(key, value)
    else params.delete(key)
  }
  const search = params.toString()
  return search ? `/transactions?${search}` : '/transactions'
}

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]
const TYPE_ICONS: Record<TransactionType, IconName> = {
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
  deposit: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_in: 'arrow-down-left',
  transfer_out: 'arrow-up-right',
}
const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}
const CREDIT_TYPES: TransactionType[] = ['deposit', 'transfer_in', 'conversion']

const TransactionsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const rawPage = Number(searchParams.get(TRANSACTION_SEARCH_PARAMS.page) ?? 1)
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1

  const type = Object.keys(TRANSACTION_TYPE_LABELS).find(
    (value) => value === searchParams.get(TRANSACTION_SEARCH_PARAMS.type)
  ) as TransactionType | undefined
  const status = Object.keys(TRANSACTION_STATUS_LABELS).find(
    (value) => value === searchParams.get(TRANSACTION_SEARCH_PARAMS.status)
  ) as TransactionStatus | undefined

  const q = searchParams.get(TRANSACTION_SEARCH_PARAMS.q) ?? ''
  const hasFilters = Boolean(q || type || status)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [searchDraft, setSearchDraft] = useState({ query: q, value: q })
  if (searchDraft.query !== q) setSearchDraft({ query: q, value: q })
  const searchValue = searchDraft.value
  const [retry, setRetry] = useState(0)
  const [request, setRequest] = useState<{
    failed: boolean
    loading: boolean
    result?: Awaited<ReturnType<typeof getTransactions>>
  }>({ loading: true, failed: false })

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setRequest((previous) => ({ ...previous, loading: true, failed: false }))
      try {
        const result = await getTransactions({ page, type, status, q }, { signal: controller.signal })
        if (controller.signal.aborted) return
        if (result.meta && page > result.meta.totalPages) {
          router.replace(queryHref(queryString, { page: String(result.meta.totalPages) }), { scroll: false })
          return
        }
        setRequest({ result, loading: false, failed: false })
      } catch {
        if (!controller.signal.aborted)
          setRequest((previous) => ({ ...previous, loading: false, failed: true }))
      }
    }
    void load()
    return () => controller.abort()
  }, [page, type, status, q, queryString, retry, router])

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    },
    [queryString]
  )

  const updateFilters = (updates: TransactionSearchUpdates) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    router.push(queryHref(queryString, { q: searchValue, ...updates, page: '1' }), {
      scroll: false,
    })
  }

  const search = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    setSearchDraft({ query: q, value })
    searchTimer.current = setTimeout(() => updateFilters({ q: value }), 300)
  }

  const { result, loading, failed } = request
  const meta = result?.meta
  const groups = groupTransactions(result?.data ?? [])
  const subtitle = meta ? (
    `${meta.total} ${hasFilters ? 'results' : 'transactions'}`
  ) : failed ? (
    'Transaction history'
  ) : (
    <Skeleton size="sm" className={styles.subtitleSkeleton} />
  )

  const clearFilters = () => updateFilters({ q: '', type: '', status: '' })

  return (
    <div>
      <div className={styles.page}>
        <header>
          <h1 className={styles.title}>Transactions</h1>
          <p
            className={styles.subtitle}
            role="status"
            aria-label={!meta && !failed ? 'Loading transaction count' : undefined}
          >
            {subtitle}
          </p>
        </header>

        <div className={cx(styles.filters, hasFilters && styles.filtersActive)}>
          <Input
            label="Search"
            aria-label="Search transactions"
            leadingIcon="search"
            value={searchValue}
            onChange={(event) => search(event.target.value)}
            placeholder="Search by reference, name or narration"
            fieldClassName={styles.desktopSearch}
          />
          <Input
            label="Search"
            aria-label="Search transactions"
            leadingIcon="search"
            value={searchValue}
            onChange={(event) => search(event.target.value)}
            placeholder="Search reference, name…"
            fieldClassName={styles.mobileSearch}
          />
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={type ?? ''}
            onValueChange={(value) => updateFilters({ type: value })}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status ?? ''}
            onValueChange={(value) => updateFilters({ status: value })}
          />
          {hasFilters && (
            <button
              type="button"
              className={cx(buttonStyles.button, buttonStyles.ghost, styles.clearFilters)}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div aria-busy={loading}>
          <Card padding="none">
            {failed ? (
              <TransactionError onRetry={() => setRetry((value) => value + 1)} />
            ) : !result ? (
              <TransactionLoading />
            ) : groups.length === 0 ? (
              <TransactionEmpty hasFilters={hasFilters} onClearFilters={clearFilters} />
            ) : (
              groups.map((group) => (
                <section key={group.date} aria-label={group.label}>
                  <h2 className={styles.day}>{group.label}</h2>
                  {group.transactions.map((tx) => {
                    const credit = CREDIT_TYPES.includes(tx.type)
                    const initials = transactionInitials(tx)
                    const badge = (
                      <Badge tone={STATUS_TONES[tx.status]} dot>
                        {TRANSACTION_STATUS_LABELS[tx.status]}
                      </Badge>
                    )
                    return (
                      <div key={tx.id} className={styles.row}>
                        <span className={styles.avatar}>
                          {initials ?? <Icon name={TYPE_ICONS[tx.type]} size={18} />}
                        </span>

                        <div className={styles.main}>
                          <p className={styles.transactionTitle}>{TRANSACTION_TYPE_LABELS[tx.type]}</p>
                          <p className={styles.narration} title={tx.narration}>
                            {tx.narration}
                          </p>
                        </div>

                        <div className={styles.status}>{badge}</div>

                        <div className={styles.end}>
                          <p className={cx(styles.amount, credit && styles.credit)}>
                            {credit ? '+' : '−'}
                            {formatMoney(tx.amount, tx.currency)}
                          </p>
                          <p className={styles.time}>{formatTransactionTime(tx.createdAt)}</p>
                          <div className={styles.mobileStatus}>{badge}</div>
                        </div>
                      </div>
                    )
                  })}
                </section>
              ))
            )}
          </Card>
        </div>

        {meta && meta.total > 0 && !failed && (
          <TransactionPagination
            meta={meta}
            loading={loading}
            pageHref={(page) => queryHref(queryString, { page: String(page) })}
          />
        )}
      </div>
    </div>
  )
}

export default TransactionsPage
