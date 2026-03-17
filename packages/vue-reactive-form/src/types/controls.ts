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
  // Updating the default value should be discouraged, so it's exposed as a read-only property
  readonly defaultState: PartialOrPrimitive<T> | undefined
  readonly dirty: boolean
  readonly touched: boolean
  /**
   * When true it means that the current state is different from the default state.
   */
  readonly isValid: boolean
  /**
   * Error messages from the validation outcome.
   */
  readonly errorMessages: string[]
  /**
   * Sets the state to undefined.
   */
  clear: () => void
  /**
   * Sets the state back to its default value.
   */
  reset: () => void
  /**
   * Updates the default value for the node.
   * This action should be discouraged, as it could lead to unwanted outcomes in dirty checking.
   *
   * @param newDefaultValue
   */
  updateDefaultState: (newDefaultValue?: PartialOrPrimitive<T>) => void
  /**
   * Sets the touched state to true.
   */
  setAsTouched: () => void
  readonly field: FieldProps<T>
}

/**
 * Control of an array node inside a form, with the give type.
 *
 * Exposes array specific methods, such as adding, removing or moving items around in the array.
 */
export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  /**
   * Adds a new item to the state of the node.
   *
   * @param defaultValue the default value for tha item added.
   */
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  /**
   * Removes an item from the state of the node.
   *
   * @param index The index of the item to remove.
   */
  remove: (index: number) => void
  /**
   *Moves an item in the state of the node from an index to another.
   *
   * @param fromIndex The starting index where the item to be moved is found.
   * @param toIndex The index where the item will be at the end of the operation.
   */
  moveItem: (fromIndex: number, toIndex: number) => void
}
