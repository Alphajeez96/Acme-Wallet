'use client'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useId, useState, type ComponentPropsWithoutRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, 'children'> {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  fieldClassName?: string
  className?: string
  id?: string
}

const encodeValue = (value: string) => `option:${value}`

export function Select({
  label,
  hideLabel,
  options,
  fieldClassName,
  className,
  id,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: SelectProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '')
  const selectedValue = value ?? internalValue
  const isOpen = open ?? internalOpen
  const reducedMotion = useReducedMotion()

  return (
    <Field label={label} hideLabel={hideLabel} className={fieldClassName}>
      <SelectPrimitive.Root
        {...rest}
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setInternalOpen(nextOpen)
          onOpenChange?.(nextOpen)
        }}
        value={encodeValue(selectedValue)}
        onValueChange={(nextValue) => {
          const decodedValue = nextValue.slice('option:'.length)
          setInternalValue(decodedValue)
          onValueChange?.(decodedValue)
        }}
      >
        <SelectPrimitive.Trigger id={controlId} aria-label={label} className={cx(styles.select, className)}>
          <SelectPrimitive.Value>
            {options.find((option) => option.value === selectedValue)?.label}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <span className={styles.chevron}>
              <motion.span
                className={styles.chevronMotion}
                initial={false}
                animate={{ rotateX: isOpen ? 180 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.455, 0.03, 0.515, 0.955] }}
              >
                <Icon name="chevron-down" size={16} />
              </motion.span>
            </span>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal forceMount>
          <AnimatePresence>
            {isOpen && (
              <SelectPrimitive.Content
                key="options"
                forceMount
                asChild
                position="popper"
                sideOffset={4}
                collisionPadding={12}
                className={styles.options}
              >
                <motion.div
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                >
                  <SelectPrimitive.Viewport>
                    {options.map((option) => (
                      <SelectPrimitive.Item
                        key={option.value}
                        value={encodeValue(option.value)}
                        className={styles.option}
                      >
                        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Viewport>
                </motion.div>
              </SelectPrimitive.Content>
            )}
          </AnimatePresence>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </Field>
  )
}
