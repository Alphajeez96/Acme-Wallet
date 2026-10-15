'use client'
import { useRef, useSyncExternalStore, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia('(max-width: 640px)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
const isMobile = () => window.matchMedia('(max-width: 640px)').matches
const serverSnapshot = () => false

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export const Drawer = ({ open, title, onClose, children, footer }: DrawerProps) => {
  const mobile = useSyncExternalStore(subscribe, isMobile, serverSnapshot)
  const reducedMotion = useReducedMotion()
  const opener = useRef<HTMLElement | null>(null)
  const offset = mobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <Dialog.Overlay key="overlay" forceMount asChild>
              <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </Dialog.Overlay>
          )}
          {open && (
            <Dialog.Content
              key="panel"
              forceMount
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={() => {
                opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
              }}
              onCloseAutoFocus={(event) => {
                if (opener.current?.isConnected) {
                  event.preventDefault()
                  opener.current.focus({ preventScroll: true })
                }
              }}
            >
              <motion.div
                className={styles.panel}
                initial={{ ...offset, opacity: 1 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ ...offset, opacity: 0 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        x: { type: 'spring', stiffness: 300, damping: 25, mass: 0.9 },
                        y: { type: 'spring', stiffness: 300, damping: 25, mass: 0.9 },
                        opacity: { delay: 0.25, duration: 0.1, ease: [0.215, 0.61, 0.355, 1] },
                      }
                }
              >
                <div className={styles.grabber} aria-hidden="true" />
                <div className={styles.header}>
                  <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.close}
                      aria-label="Close transaction details"
                    >
                      <Icon name="close" size={20} />
                    </Button>
                  </Dialog.Close>
                </div>
                <div className={styles.body}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
