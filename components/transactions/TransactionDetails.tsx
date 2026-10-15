'use client'
import { useEffect, useState, type ReactNode } from 'react'

import { format } from 'date-fns'
import { ApiError } from '@/lib/api/client'
import type { Transaction } from '@/types/api'
import { getTransaction } from '@/lib/api/endpoints'
import styles from './TransactionDetails.module.css'
import { motion, useReducedMotion } from 'motion/react'
import { Badge, Button, Icon, Skeleton } from '@/components/ui'
import { CREDIT_TYPES, STATUS_TONES, TYPE_ICONS, transactionInitials } from './format'
import { formatMoney, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

const DetailRow = ({
  label,
  children,
  total = false,
  loading = false,
}: {
  label: string
  total?: boolean
  loading?: boolean
  children: ReactNode
}) => (
  <div className={total ? styles.total : styles.row}>
    <dt>{loading ? <Skeleton size="sm" className={styles.loadingLabel} /> : label}</dt>
    <dd>{children}</dd>
  </div>
)

export const TransactionDetails = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const [retry, setRetry] = useState(0)
  const [request, setRequest] = useState<{ transaction?: Transaction; error?: 'missing' | 'failed' }>({})
  const [copyStatus, setCopyStatus] = useState('')

  const copied = copyStatus === 'Reference copied'
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopyStatus(''), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setRequest({})
      try {
        const result = await getTransaction(id, { signal: controller.signal })
        if (!controller.signal.aborted) setRequest({ transaction: result.data })
      } catch (error) {
        if (!controller.signal.aborted)
          setRequest({ error: error instanceof ApiError && error.status === 404 ? 'missing' : 'failed' })
      }
    }
    void load()
    return () => controller.abort()
  }, [id, retry])

  const copyReference = async () => {
    if (!request.transaction) return
    try {
      await navigator.clipboard.writeText(request.transaction.reference)
      setCopyStatus('Reference copied')
    } catch {
      setCopyStatus('Couldn’t copy reference. Please copy it manually.')
    }
  }

  if (request.error)
    return (
      <div className={styles.state} role="alert">
        <span className={styles.stateIcon}>
          <Icon name={request.error === 'missing' ? 'search' : 'alert'} size={24} />
        </span>
        <div>
          <h3>
            {request.error === 'missing' ? 'Transaction not found' : 'We couldn’t load this transaction'}
          </h3>
          <p>
            {request.error === 'missing'
              ? 'It may have been removed, or the link is wrong.'
              : 'Check your connection and try again.'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={request.error === 'missing' ? onClose : () => setRetry((value) => value + 1)}
        >
          {request.error === 'missing' ? 'Back to transactions' : 'Try again'}
        </Button>
      </div>
    )
  const tx = request.transaction
  const credit = tx && CREDIT_TYPES.includes(tx.type)
  const initials = tx && transactionInitials(tx)
  const typeLabel = tx && TRANSACTION_TYPE_LABELS[tx.type]
  const description = tx?.counterparty
    ? `${typeLabel}${tx.type === 'transfer_in' ? ' from' : tx.type === 'transfer_out' ? ' to' : ' —'} ${tx.counterparty}`
    : typeLabel

  return (
    <div className={styles.content} aria-busy={!tx}>
      <div className={styles.hero}>
        {tx ? (
          <span className={styles.avatar}>{initials ?? <Icon name={TYPE_ICONS[tx.type]} size={24} />}</span>
        ) : (
          <Skeleton type="circle" className={styles.loadingAvatar} />
        )}
        <p className={styles.description}>
          {tx ? description : <Skeleton size="sm" className={styles.loadingDescription} />}
        </p>
        <p className={styles.amount}>
          {tx ? (
            <>
              {credit ? '+' : '−'}
              {formatMoney(tx.amount, tx.currency)}
            </>
          ) : (
            <Skeleton className={styles.loadingAmount} />
          )}
        </p>
        {tx ? (
          <Badge tone={STATUS_TONES[tx.status]} dot>
            {TRANSACTION_STATUS_LABELS[tx.status]}
          </Badge>
        ) : (
          <Skeleton className={styles.loadingBadge} />
        )}
      </div>
      <section className={styles.section} aria-label="Details">
        <h3>Details</h3>
        <dl className={styles.list}>
          <DetailRow loading={!tx} label="Reference">
            {tx ? (
              <span className={styles.reference}>
                <span className={styles.mono}>{tx.reference}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.copy}
                  aria-label={copied ? 'Reference copied' : 'Copy transaction reference'}
                  aria-disabled={copied}
                  onClick={copied ? undefined : copyReference}
                >
                  <span className={styles.copyViewport}>
                    <motion.span
                      className={styles.copyTrack}
                      initial={false}
                      animate={{ y: copied ? -16 : 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
                    >
                      <Icon name="copy" size={16} />
                      <Icon name="check" size={16} />
                    </motion.span>
                  </span>
                </Button>
              </span>
            ) : (
              <span className={styles.referencePlaceholder}>
                <Skeleton size="sm" className={styles.loadingValue} />
              </span>
            )}
          </DetailRow>
          <DetailRow loading={!tx} label="Date">
            {tx ? (
              format(new Date(tx.createdAt), 'EEE, d MMM yyyy, HH:mm')
            ) : (
              <Skeleton size="sm" className={styles.loadingValue} />
            )}
          </DetailRow>
          <DetailRow loading={!tx} label="Type">
            {tx ? typeLabel : <Skeleton size="sm" className={styles.loadingValue} />}
          </DetailRow>
          <DetailRow loading={!tx} label="Counterparty">
            {tx ? (tx.counterparty ?? '—') : <Skeleton size="sm" className={styles.loadingValue} />}
          </DetailRow>
          <DetailRow loading={!tx} label="Narration">
            {tx ? tx.narration : <Skeleton size="sm" className={styles.loadingValue} />}
          </DetailRow>
        </dl>
      </section>
      <section className={styles.section} aria-label="Summary">
        <h3>Summary</h3>
        <dl className={styles.list}>
          <DetailRow loading={!tx} label="Amount">
            {tx ? (
              formatMoney(tx.amount, tx.currency)
            ) : (
              <Skeleton size="sm" className={styles.loadingValue} />
            )}
          </DetailRow>
          <DetailRow loading={!tx} label="Fee">
            {tx ? formatMoney(tx.fee, tx.currency) : <Skeleton size="sm" className={styles.loadingValue} />}
          </DetailRow>
          <DetailRow loading={!tx} label="Total" total>
            {tx ? (
              formatMoney(tx.amount + tx.fee, tx.currency)
            ) : (
              <Skeleton size="sm" className={styles.loadingValue} />
            )}
          </DetailRow>
        </dl>
      </section>
      <span className="visually-hidden" role="status">
        {copyStatus}
      </span>
    </div>
  )
}
