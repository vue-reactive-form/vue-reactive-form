import type { ReactivityAdapter, Cell } from "./types/adapter"
import { resolveGetter } from "./types/adapter"
import type {
  ControlsCache,
  FormContext,
  FormErrors,
  FormMeta,
  UseFormContextOptions
} from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { cloneDeep, get, set, type PropertyPath } from "lodash-es"
import {
  buildErrorsObject,
  standardValidate,
  type ValidationIssue
} from "./validation"
import { isDirty } from "./utils"

const getPathAsString = (path: PropertyPath) => {
  return Array.isArray(path) && path.length ? path.join(".") : ""
}

export const useFormContext = <TState, TValidatedState = TState>(
  adapter: ReactivityAdapter,
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormContextOptions<TState, TValidatedState> = {}
): FormContext<PartialOrPrimitive<TState>, TValidatedState> => {
  const { validationSchema, validateOn = "submit" } = options

  const defaultFormState = adapter.cell(
    cloneDeep(defaultState) as PartialOrPrimitive<TState | undefined>
  ) as Cell<PartialOrPrimitive<TState | undefined>>
  const state = adapter.cell(
    cloneDeep(defaultState) as PartialOrPrimitive<TState>
  ) as Cell<PartialOrPrimitive<TState>>
  const controlsCache: ControlsCache = new Map()
  const errors = adapter.cell({} as FormErrors)
  const touchedFields = adapter.cell(new Set<string>())
  const submitting = adapter.cell(false)
  const submitted = adapter.cell(false)
  const submitCount = adapter.cell(0)

  const setFieldState = (
    path: PropertyPath,
    value: any,
    stateType: "default" | "current"
  ) => {
    const toBeUpdated = stateType === "default" ? defaultFormState : state

    if (Array.isArray(path) && path.length) {
      adapter.update(toBeUpdated, (prev) => {
        const next = cloneDeep(prev)
        set(next as object, path, value)
        return next
      })
    } else {
      adapter.update(toBeUpdated, value)
    }

    if (stateType === "current") {
      setFieldErrors(path, [])
    }
  }

  const getFieldState = (
    path: PropertyPath,
    stateType: "default" | "current"
  ) => {
    const toBeRead = stateType === "default" ? defaultFormState : state

    return Array.isArray(path) && path.length
      ? get(adapter.get(toBeRead), path)
      : adapter.get(toBeRead)
  }

  const getFieldErrors = (path: PropertyPath) => {
    return adapter.get(errors)[getPathAsString(path)] ?? []
  }

  const setFieldErrors = (path: PropertyPath, issues: ValidationIssue[]) => {
    adapter.update(errors, (prev) => ({
      ...prev,
      [getPathAsString(path)]: issues
    }))
  }

  const setFieldAsTouched = (path: PropertyPath) => {
    adapter.update(touchedFields, (prev) => new Set([...prev, getPathAsString(path)]))
  }

  const isFieldTouched = (path: PropertyPath) => {
    return adapter.get(touchedFields).has(getPathAsString(path))
  }

  const setAllFieldsAsTouched = () => {
    const keys = [...controlsCache.keys()]
    adapter.update(touchedFields, (prev) => new Set([...prev, ...keys]))
  }

  const onSubmitStart = () => {
    adapter.update(submitting, true)
    adapter.update(submitCount, (n) => n + 1)
  }

  const onSubmitEnd = () => {
    adapter.update(submitting, false)
    adapter.update(submitted, true)
  }

  const meta: FormMeta = {
    get errors() {
      return adapter.get(errors)
    },
    set errors(v: FormErrors) {
      adapter.update(errors, v)
    },
    get isValid() {
      return Object.values(adapter.get(errors)).every(
        (issues) => issues.length === 0
      )
    },
    get isDirty() {
      return isDirty(adapter.get(state), adapter.get(defaultFormState))
    },
    get isTouched() {
      return adapter.get(touchedFields).size > 0
    },
    get isSubmitting() {
      return adapter.get(submitting)
    },
    get isSubmitted() {
      return adapter.get(submitted)
    },
    get submitCount() {
      return adapter.get(submitCount)
    }
  }

  let validationGeneration = 0

  const runValidation = async () => {
    const schema =
      validationSchema != null ? resolveGetter(validationSchema) : undefined

    if (!schema) {
      console.warn(
        "[nano-form] No validation schema provided. Skipping validation."
      )
      return {
        skipped: true as const,
        state: adapter.get(state) as unknown as TValidatedState
      }
    }

    const currentGeneration = ++validationGeneration

    const result = await standardValidate(schema, adapter.get(state))

    if (currentGeneration !== validationGeneration) {
      return { stale: true as const }
    }

    return result
  }

  const validate = async () => {
    const result = await runValidation()

    if ("skipped" in result) return result.state
    if ("stale" in result) return

    adapter.update(errors, {})

    if (!result.success) {
      adapter.update(errors, buildErrorsObject(result.issues))
      return
    } else {
      return result.output
    }
  }

  const validateField = async (path: PropertyPath) => {
    const result = await runValidation()

    if ("skipped" in result || "stale" in result) return

    const pathStr = getPathAsString(path)

    if (!result.success) {
      const allErrors = buildErrorsObject(result.issues)
      adapter.update(errors, (prev) => ({
        ...prev,
        [pathStr]: allErrors[pathStr] ?? []
      }))
    } else {
      adapter.update(errors, (prev) => {
        const next = { ...prev }
        delete next[pathStr]
        return next
      })
    }
  }

  return {
    controlsCache,
    setFieldState,
    setFieldErrors,
    setFieldAsTouched,
    setAllFieldsAsTouched,
    onSubmitStart,
    onSubmitEnd,
    meta,
    getFieldState,
    getFieldErrors,
    isFieldTouched,
    validate,
    validateField,
    validateOn
  }
}
