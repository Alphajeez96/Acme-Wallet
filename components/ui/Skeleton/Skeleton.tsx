import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  type?: 'text' | 'circle' | 'rectangle'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Skeleton = ({ type = 'text', size = 'md', className }: SkeletonProps) => (
  <span aria-hidden="true" className={cx(styles.skeleton, styles[type], styles[size], className)} />
)
