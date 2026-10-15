'use client'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useId, type ComponentPropsWithoutRef } from 'react'
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
  ...rest
}: SelectProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId

  return (
    <Field label={label} hideLabel={hideLabel} className={fieldClassName}>
      <SelectPrimitive.Root
        {...rest}
        value={value === undefined ? undefined : encodeValue(value)}
        defaultValue={encodeValue(defaultValue ?? options[0]?.value ?? '')}
        onValueChange={(nextValue) => onValueChange?.(nextValue.slice('option:'.length))}
      >
        <SelectPrimitive.Trigger id={controlId} aria-label={label} className={cx(styles.select, className)}>
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon asChild>
            <Icon name="chevron-down" size={16} className={styles.chevron} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            collisionPadding={12}
            className={styles.options}
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
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </Field>
  )
}
