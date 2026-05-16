import { computed, type Signal } from "@angular/core"
import type {
  BaseInputControl,
  ControlExtension,
  CreateControlExtension,
  FieldBinding,
  PartialOrPrimitive
} from "@nano-form/core"

/**
 * Angular-specific field props produced from a FieldBinding.
 * `value` is a computed Signal so it integrates with Angular's signal-based
 * change detection. Bind it in templates as `[value]="ctrl.field.value()"`.
 */
export type AngularFieldProps<T> = {
  readonly value: Signal<PartialOrPrimitive<T> | undefined>
  readonly onChange: (value: PartialOrPrimitive<T> | undefined) => void
  readonly onFocus: () => void
  readonly onBlur: () => void | Promise<void>
}

/**
 * Maps a framework-agnostic FieldBinding to Angular signal-based props.
 * The computed Signal auto-tracks any signals read inside `binding.value`.
 */
export const toAngularField = <T>(
  binding: FieldBinding<T>
): AngularFieldProps<T> => ({
  value: computed(() => binding.value),
  onChange: binding.onChange,
  onFocus: binding.onFocus,
  onBlur: binding.onBlur
})

export const createAngularExtension: CreateControlExtension = <T>(
  _control: BaseInputControl<T>,
  binding: FieldBinding<T>
): ControlExtension<T> =>
  ({
    field: toAngularField(binding)
  }) as ControlExtension<T>
