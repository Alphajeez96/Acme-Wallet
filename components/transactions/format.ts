import type { Transaction } from '@/types/api'
import { format, isToday, isYesterday } from 'date-fns'

export const formatTransactionTime = (iso: string) => format(new Date(iso), 'HH:mm')

export const transactionInitials = (tx: Transaction) => {
  if (tx.type !== 'transfer_in' && tx.type !== 'transfer_out') return undefined
  return tx.counterparty
    ?.split(/[\s-]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export const groupTransactions = (transactions: Transaction[]) => {
  const groups = new Map<string, { date: string; label: string; transactions: Transaction[] }>()

  for (const transaction of transactions) {
    const createdAt = new Date(transaction.createdAt)
    const date = format(createdAt, 'yyyy-MM-dd')
    let group = groups.get(date)

    if (!group) {
      group = {
        date,
        label: isToday(createdAt)
          ? 'Today'
          : isYesterday(createdAt)
            ? 'Yesterday'
            : format(createdAt, 'EEE, d MMM yyyy'),
        transactions: [],
      }
      groups.set(date, group)
    }
    group.transactions.push(transaction)
  }
  return Array.from(groups.values())
}

export const paginationPages = (page: number, totalPages: number) => {
  return [...new Set([1, 2, 3, page - 1, page, page + 1, totalPages])]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b)
}
