'use client'
import { useEffect, useState } from 'react'
import type { Currency, Rate } from '@/types/api'
import { Card, CardHeader, Skeleton } from '@/components/ui'
import { getRate } from '@/lib/api/endpoints'
import { formatTime } from '@/lib/format'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

export function RatesWidget({ base }: { base: Currency }) {
  const [rates, setRates] = useState<Rate[]>()

  useEffect(() => {
    Promise.all(QUOTES.map((quote) => getRate(quote, base))).then((results) =>
      setRates(results.map((res) => res.data))
    )
  }, [base])
  const updatedAt = rates?.[0]?.updatedAt

  return (
    <Card>
      <CardHeader title="Today's rates" />
      <dl className={styles.list}>
        {QUOTES.map((quote, i) => {
          const rate = rates?.[i]
          return (
            <div key={quote} className={styles.row}>
              <dt>1 {quote}</dt>
              <dd className={styles.value}>
                {rate ? `${rate.rate} ${base}` : <Skeleton size="sm" className={styles.rateSkeleton} />}
              </dd>
            </div>
          )
        })}
      </dl>
      <p className={styles.updated}>
        {updatedAt ? (
          `Updated ${formatTime(updatedAt)}`
        ) : (
          <Skeleton size="sm" className={styles.timeSkeleton} />
        )}
      </p>
    </Card>
  )
}
