import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FormNode } from "./formNodes"
import type { InputControl } from "./controls"
import type { ValidationIssue } from "../validation"
import type { MaybeGetter } from "./adapter"
import type { RequiredOrPrimitive } from "./utils"
import type { PropertyPath } from "lodash-es"

export type ControlsCache = Map<string, InputControl<unknown>>

export type FormErrors = Record<string, ValidationIssue[]>

export type FormMeta = {
  errors: FormErrors
  isValid: boolean
  isDirty: boolean
  isTouched: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  submitCount: number
}

export type FormContext<TState, TValidatedState = TState> = {
  controlsCache: ControlsCache
  setFieldState: (
    path: PropertyPath,
    value: unknown,
    stateType: "default" | "current"
  ) => void
  getFieldState: (path: PropertyPath, stateType: "default" | "current") => any
  getFieldErrors: (path: PropertyPath) => ValidationIssue[]
  setFieldErrors: (path: PropertyPath, errors: ValidationIssue[]) => void
  setFieldAsTouched: (path: PropertyPath) => void
  isFieldTouched: (path: PropertyPath) => boolean
  setAllFieldsAsTouched: () => void
  meta: FormMeta
  onSubmitStart: () => void
  onSubmitEnd: () => void
  validate: () => Promise<TValidatedState | undefined>
  validateField: (path: PropertyPath) => Promise<void>
  validateOn: ValidateOn
}

export type ValidateOn = "submit" | "blur"

export type UseFormContextOptions<TState, TValidatedState = TState> = {
  validationSchema?: MaybeGetter<
    StandardSchemaV1<TState, TValidatedState> | undefined
  >
  validateOn?: ValidateOn
}

export type UseFormOptions<
  TState,
  TValidatedState = TState
> = UseFormContextOptions<TState, TValidatedState>

export type HandleSubmitOptions<TValidatedState> = {
  onSuccess?: (state: TValidatedState) => void
  onError?: (errors: FormErrors) => void
}

export type HandleFormSubmit<TValidatedState> = (
  opts?: HandleSubmitOptions<TValidatedState>
) => (e?: Event) => Promise<void>

export type FormRoot<TState, TValidatedState = TState> = {
  form: FormNode<RequiredOrPrimitive<TState>>
  meta: FormMeta
  validate: () => Promise<TValidatedState | undefined>
  handleSubmit: HandleFormSubmit<TValidatedState>
}
