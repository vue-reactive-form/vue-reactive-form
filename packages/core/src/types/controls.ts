import type { PartialOrPrimitive } from "./utils"

/**
 * Props meant to be bound to the input component with v-bind.
 * Includes modelValue + onUpdate:modelValue for two-way binding,
 * onFocus (marks as touched), and onBlur (triggers validation when validateOn is "blur").
 */
export type FieldProps<T> = {
  readonly modelValue: PartialOrPrimitive<T> | undefined
  readonly "onUpdate:modelValue": (value: PartialOrPrimitive<T> | undefined) => void
  readonly onFocus: () => void
  readonly onBlur: () => void
}

/**
 * Control of a node inside a form, with the give type.
 *
 * Allows access to the state management for the node, and metadata describing its status.
 */
export type InputControl<T> = {
  state: PartialOrPrimitive<T> | undefined
  readonly defaultState: PartialOrPrimitive<T> | undefined
  readonly dirty: boolean
  readonly touched: boolean
  readonly isValid: boolean
  readonly errorMessages: string[]
  clear: () => void
  reset: () => void
  updateDefaultState: (newDefaultValue?: PartialOrPrimitive<T>) => void
  setAsTouched: () => void
  validate: () => Promise<void>
  readonly field: FieldProps<T>
}

/**
 * Control of an array node inside a form, with the give type.
 *
 * Exposes array specific methods, such as adding, removing or moving items around in the array.
 */
export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}
