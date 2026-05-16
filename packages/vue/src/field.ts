import type {
  BaseInputControl,
  ControlExtension,
  CreateControlExtension,
  FieldBinding,
  PartialOrPrimitive
} from "@nano-form/core"

/**
 * Vue-specific field props produced from a FieldBinding.
 * Intended to be spread onto a component with v-bind.
 */
export type VueFieldProps<T> = {
  readonly modelValue: PartialOrPrimitive<T> | undefined
  readonly "onUpdate:modelValue": (
    value: PartialOrPrimitive<T> | undefined
  ) => void
  readonly onFocus: () => void
  readonly onBlur: () => void | Promise<void>
}

/**
 * Maps a framework-agnostic FieldBinding to Vue v-model props.
 * `modelValue` is a getter so it stays reactive when bound through v-bind.
 */
export const toVueField = <T>(binding: FieldBinding<T>): VueFieldProps<T> =>
  ({
    get modelValue() {
      return binding.value
    },
    "onUpdate:modelValue": binding.onChange,
    onFocus: binding.onFocus,
    onBlur: binding.onBlur
  }) as VueFieldProps<T>

/**
 * Vue's control extension factory. Adds `field` (Vue v-model props) to every
 * control. Passed to createUseForm so users don't have to call toVueField
 * themselves at every input.
 */
export const createVueExtension: CreateControlExtension = <T>(
  _control: BaseInputControl<T>,
  binding: FieldBinding<T>
): ControlExtension<T> =>
  ({
    field: toVueField(binding)
  }) as ControlExtension<T>
