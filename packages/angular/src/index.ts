import type { StandardSchemaV1 } from "@standard-schema/spec"
import { isSignal, type Signal } from "@angular/core"
import { createUseForm } from "@nano-form/core"
import type {
  UseFormContextOptions,
  FormRoot,
  PartialOrPrimitive
} from "@nano-form/core"
import { angularAdapter } from "./adapter"
import { createAngularExtension, type AngularFieldProps } from "./field"

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

export type { AngularFieldProps } from "./field"
export { toAngularField, createAngularExtension } from "./field"

// Declaration merging: every control produced through @nano-form/angular exposes
// a typed `field` with a computed Signal value ready to bind in templates.
declare module "@nano-form/core" {
  interface ControlExtension<T> {
    field: AngularFieldProps<T>
  }
}

export type UseFormOptions<TState, TValidatedState = TState> = Omit<
  UseFormContextOptions<TState, TValidatedState>,
  "validationSchema"
> & {
  validationSchema?:
    | Signal<StandardSchemaV1<TState, TValidatedState> | undefined>
    | StandardSchemaV1<TState, TValidatedState>
}

const _useForm = createUseForm(angularAdapter, createAngularExtension)

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const { validationSchema, ...rest } = options
  return _useForm<TState, TValidatedState>(defaultState, {
    ...rest,
    ...(validationSchema != null && {
      // Signal<T> is callable, so it satisfies MaybeGetter directly.
      // A static schema is wrapped in a getter so both paths are uniform.
      validationSchema: isSignal(validationSchema)
        ? validationSchema
        : () => validationSchema
    })
  })
}
