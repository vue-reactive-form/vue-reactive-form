import type { PartialOrPrimitive } from "./utils"

/**
 * Framework-agnostic binding passed by the core to the extension factory.
 * Adapter authors use this to produce framework-specific props.
 */
export type FieldBinding<T> = {
  readonly value: PartialOrPrimitive<T> | undefined
  readonly onChange: (value: PartialOrPrimitive<T> | undefined) => void
  readonly onFocus: () => void
  readonly onBlur: () => void | Promise<void>
}

/**
 * Augmentation slot for framework-specific control properties.
 * Framework packages add properties via `declare module` interface merging.
 *
 * @example
 * declare module "@nano-form/core" {
 *   interface ControlExtension<T> {
 *     field: VueFieldProps<T>
 *   }
 * }
 */
export interface ControlExtension<T> {}

/**
 * Framework-agnostic base shape produced by the core for every control.
 * Framework-specific properties (e.g. `field`) are added via ControlExtension.
 */
export type BaseInputControl<T> = {
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
}

/**
 * Control of a node inside a form. Combines the core BaseInputControl<T>
 * with any framework-specific augmentations declared in ControlExtension<T>.
 */
export type InputControl<T> = BaseInputControl<T> & ControlExtension<T>

/**
 * Control of an array node inside a form, with the given type.
 *
 * Exposes array-specific methods, such as adding, removing or moving items
 * around in the array. Inherits any ControlExtension augmentations.
 */
export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}

/**
 * Factory used by framework adapters to build their ControlExtension for each
 * control. Receives the base control and a pre-wired field binding.
 */
export type CreateControlExtension = <T>(
  control: BaseInputControl<T>,
  binding: FieldBinding<T>
) => ControlExtension<T>
