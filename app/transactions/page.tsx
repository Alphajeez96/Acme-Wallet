'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { useRouter, useSearchParams } from 'next/navigation'
import { getTransactions, type TransactionQuery } from '@/lib/api/endpoints'
import { TransactionDetails } from '@/components/transactions/TransactionDetails'
import { TransactionPagination } from '@/components/transactions/TransactionPagination'
import { Badge, Button, Card, Drawer, Icon, Input, Select, Skeleton } from '@/components/ui'
import { formatMoney, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import {
  TYPE_ICONS,
  CREDIT_TYPES,
  STATUS_TONES,
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
import type { TransactionStatus, TransactionType } from '@/types/api'

type TransactionSearchKey = keyof Pick<TransactionQuery, 'page' | 'type' | 'status' | 'q'> | 'id'

const TRANSACTION_SEARCH_PARAMS = {
  q: 'q',
  id: 'id',
  page: 'page',
  type: 'type',
  status: 'status',
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

const TransactionsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get(TRANSACTION_SEARCH_PARAMS.id)
  const listParams = new URLSearchParams(searchParams.toString())
  listParams.delete(TRANSACTION_SEARCH_PARAMS.id)
  const queryString = listParams.toString()

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

  const [searchDraft, setSearchDraft] = useState({ query: queryString, value: q })
  if (searchDraft.query !== queryString) setSearchDraft({ query: queryString, value: q })
  const searchValue = searchDraft.value
  const [retry, setRetry] = useState(0)
  const [request, setRequest] = useState<{
    failed: boolean
    loading: boolean
    resultHasFilters?: boolean
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
        setRequest({ result, resultHasFilters: Boolean(q || type || status), loading: false, failed: false })
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
    setSearchDraft({ query: queryString, value })
    searchTimer.current = setTimeout(() => updateFilters({ q: value }), 300)
  }

  const { result, loading, failed } = request
  const resultHasFilters = request.resultHasFilters ?? hasFilters
  const meta = result?.meta
  const groups = groupTransactions(result?.data ?? [])
  const subtitle = meta ? (
    `${meta.total} ${resultHasFilters ? 'results' : 'transactions'}`
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
            fieldClassName={styles.search}
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
            <Button variant="ghost" className={styles.clearFilters} onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div aria-busy={loading}>
          <Card padding="none">
            {failed ? (
              <TransactionError onRetry={() => setRetry((value) => value + 1)} />
            ) : !result ? (
              <TransactionLoading count={10} />
            ) : groups.length === 0 ? (
              <TransactionEmpty hasFilters={resultHasFilters} onClearFilters={clearFilters} />
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
                      <Link
                        key={tx.id}
                        scroll={false}
                        className={styles.row}
                        aria-haspopup="dialog"
                        href={queryHref(queryString, { id: tx.id })}
                      >
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
                      </Link>
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
            pageHref={(page) =>
              queryHref(queryString, { q: searchValue, page: searchValue !== q ? '1' : String(page) })
            }
          />
        )}
      </div>

      <Drawer
        open={Boolean(selectedId)}
        title="Transaction details"
        onClose={() => router.replace(queryHref(queryString, {}), { scroll: false })}
      >
        {selectedId && (
          <TransactionDetails
            key={selectedId}
            id={selectedId}
            onClose={() => router.replace(queryHref(queryString, {}), { scroll: false })}
          />
        )}
      </Drawer>
    </div>
  )
}

export default TransactionsPage
