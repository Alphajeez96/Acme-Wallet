import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Icon } from '@/components/ui'
import { paginationPages } from './format'
import type { PageMeta } from '@/types/api'

import styles from './TransactionPagination.module.css'
import buttonStyles from '@/components/ui/Button/Button.module.css'

const ACTION_CLASS = cx(buttonStyles.button, buttonStyles.secondary, buttonStyles.sm)

const PageLink = ({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) => {
  const className = cx(ACTION_CLASS, styles.paginationButton, disabled && buttonStyles.disabled)
  return disabled ? (
    <span className={className} aria-disabled="true">
      {children}
    </span>
  ) : (
    <Link href={href} scroll={false} className={className}>
      {children}
    </Link>
  )
}

export const TransactionPagination = ({
  meta,
  loading,
  pageHref,
}: {
  meta: PageMeta
  loading: boolean
  pageHref: (page: number) => string
}) => {
  const currentPage = meta.page
  const totalPages = meta.totalPages
  const pages = paginationPages(currentPage, totalPages)

  return (
    <nav className={styles.pagination} aria-label="Transaction pages">
      <p className={styles.desktopSummary}>
        Showing {(currentPage - 1) * meta.limit + 1}–{Math.min(currentPage * meta.limit, meta.total)} of{' '}
        {meta.total}
      </p>

      <div className={styles.pages}>
        <PageLink href={pageHref(currentPage - 1)} disabled={loading || currentPage <= 1}>
          <Icon name="chevron-left" size={16} />
          Previous
        </PageLink>

        {pages.map((number, index) => (
          <Fragment key={number}>
            {index > 0 && number - pages[index - 1] > 1 && <span className={styles.ellipsis}>…</span>}
            <Link
              href={pageHref(number)}
              scroll={false}
              className={number === currentPage ? styles.currentPage : styles.pageNumber}
              aria-current={number === currentPage ? 'page' : undefined}
              aria-label={`Page ${number}`}
            >
              {number}
            </Link>
          </Fragment>
        ))}

        <PageLink href={pageHref(currentPage + 1)} disabled={loading || currentPage >= totalPages}>
          Next
          <Icon name="chevron-right" size={16} />
        </PageLink>
      </div>

      <div className={styles.mobilePages}>
        <PageLink href={pageHref(currentPage - 1)} disabled={loading || currentPage <= 1}>
          <Icon name="chevron-left" size={16} />
          Prev
        </PageLink>

        <p>
          Page {currentPage} of {totalPages}{' '}
        </p>

        <PageLink href={pageHref(currentPage + 1)} disabled={loading || currentPage >= totalPages}>
          Next
          <Icon name="chevron-right" size={16} />
        </PageLink>
      </div>
    </nav>
  )
}
