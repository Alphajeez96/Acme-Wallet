import type { Currency, TransactionStatus, TransactionType } from '@/types/api'

interface StaticTransaction {
  type: TransactionType
  status: TransactionStatus
  currency: Currency
  amount: number
  narration: string
  initials?: string
  time: string
}

// Illustrative content copied from the supplied Figma frame; no API binding.
export const TRANSACTION_GROUPS: Array<{ label: string; transactions: StaticTransaction[] }> = [
  {
    label: 'Today',
    transactions: [
      {
        type: 'card_payment',
        status: 'successful',
        currency: 'USD',
        amount: 1549,
        narration: 'Card payment - Netflix',
        time: '14:22',
      },
      {
        type: 'transfer_in',
        status: 'pending',
        currency: 'NGN',
        amount: 2500000,
        narration: 'Transfer from Ada Okafor',
        initials: 'AO',
        time: '09:03',
      },
      {
        type: 'bill_payment',
        status: 'failed',
        currency: 'NGN',
        amount: 1850000,
        narration: 'Bill payment - Ikeja Electric',
        time: '08:41',
      },
    ],
  },
  {
    label: 'Yesterday',
    transactions: [
      {
        type: 'transfer_in',
        status: 'successful',
        currency: 'NGN',
        amount: 249999999999,
        narration: 'Transfer from Okonkwo-Adeyemi Logistics & Haulage International Ltd',
        initials: 'OA',
        time: '21:16',
      },
      {
        type: 'conversion',
        status: 'successful',
        currency: 'NGN',
        amount: 15302500,
        narration: 'Converted USD to NGN',
        time: '17:50',
      },
      {
        type: 'withdrawal',
        status: 'successful',
        currency: 'USD',
        amount: 22303,
        narration: 'Withdrawal to GTBank ****1436',
        time: '11:02',
      },
    ],
  },
  {
    label: 'Mon, 5 Oct 2026',
    transactions: [
      {
        type: 'card_payment',
        status: 'successful',
        currency: 'USD',
        amount: 124000,
        narration:
          'Card payment - GOOGLE *CLOUD PLATFORM SUBSCRIPTION RENEWAL ANNUAL BILLING CYCLE REF 8841-2219-0034 DUBLIN IE',
        time: '19:30',
      },
      {
        type: 'transfer_out',
        status: 'successful',
        currency: 'GHS',
        amount: 120000,
        narration: 'Transfer to Kwame Mensah',
        initials: 'KM',
        time: '10:15',
      },
      {
        type: 'deposit',
        status: 'successful',
        currency: 'NGN',
        amount: 50000000,
        narration: 'Wallet top-up via bank transfer',
        time: '07:58',
      },
    ],
  },
]
