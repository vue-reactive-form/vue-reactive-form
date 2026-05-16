import type { StandardSchemaV1 } from "@standard-schema/spec"
import { toValue, type MaybeRef } from "@vue/reactivity"
import { createUseForm } from "@nano-form/core"
import type {
  UseFormContextOptions,
  FormRoot,
  PartialOrPrimitive
} from "@nano-form/core"
import { vueAdapter } from "./adapter"
import { createVueExtension, type VueFieldProps } from "./field"

export type {
  FormRoot,
  FormMeta,
  FormErrors,
  FormContext,
  HandleSubmitOptions,
  HandleFormSubmit,
  ValidateOn,
  ArrayInputControl,
  FieldBinding,
  InputControl,
  FormNode,
  ArrayFormNode,
  MaybeGetter,
  ValidationIssue
} from "@nano-form/core"

export type { VueFieldProps } from "./field"
export { toVueField, createVueExtension } from "./field"

// Declaration merging: every control produced through @nano-form/vue exposes
// a typed `field` ready to v-bind on inputs.
declare module "@nano-form/core" {
  interface ControlExtension<T> {
    field: VueFieldProps<T>
  }
}

export type UseFormOptions<TState, TValidatedState = TState> = Omit<
  UseFormContextOptions<TState, TValidatedState>,
  "validationSchema"
> & {
  validationSchema?: MaybeRef<
    StandardSchemaV1<TState, TValidatedState> | undefined
  >
}

const _useForm = createUseForm(vueAdapter, createVueExtension)

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const { validationSchema, ...rest } = options
  return _useForm<TState, TValidatedState>(defaultState, {
    ...rest,
    ...(validationSchema != null && {
      validationSchema: () => toValue(validationSchema)
    })
  })
}
