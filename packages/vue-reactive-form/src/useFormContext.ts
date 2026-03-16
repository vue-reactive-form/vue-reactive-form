import { ref, toValue, type Ref } from "@vue/reactivity"
import type {
  ControlsCache,
  FormContext,
  FormErrors,
  UseFormContextOptions
} from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { cloneDeep, get, set, type PropertyPath } from "lodash-es"
import {
  buildErrorsObject,
  standardValidate,
  type ValidationIssue
} from "./validation"

const getPathAsString = (path: PropertyPath) => {
  return Array.isArray(path) && path.length ? path.join(".") : ""
}

export const useFormContext = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormContextOptions<TState, TValidatedState> = {}
): FormContext<PartialOrPrimitive<TState>, TValidatedState> => {
  const { validationSchema, validateOn = "submit" } = options

  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    PartialOrPrimitive<TState | undefined>
  >
  const state = ref(cloneDeep(defaultState)) as Ref<PartialOrPrimitive<TState>>
  const controlsCache: ControlsCache = new Map()
  const errors = ref<FormErrors>({})
  const touchedFields = ref(new Set<string>())

  const setFieldState = (
    path: PropertyPath,
    value: any,
    stateType: "default" | "current"
  ) => {
    const toBeUpdated = stateType === "default" ? defaultFormState : state

    if (Array.isArray(path) && path.length) {
      set(toBeUpdated, ["value", ...path], value)
    } else {
      toBeUpdated.value = value
    }

    if (stateType === "current") {
      // When updating the state of the field, we clear any validation issues,
      // so they don't persist until the next validation is performed
      setFieldErrors(path, [])
    }
  }

  const getFieldState = (
    path: PropertyPath,
    stateType: "default" | "current"
  ) => {
    const toBeUpdated = stateType === "default" ? defaultFormState : state

    return Array.isArray(path) && path.length
      ? get(toBeUpdated.value, path)
      : toBeUpdated.value
  }

  const getFieldErrors = (path: PropertyPath) => {
    return errors.value[getPathAsString(path)] ?? []
  }

  const setFieldErrors = (path: PropertyPath, issues: ValidationIssue[]) => {
    errors.value[getPathAsString(path)] = issues
  }

  const setFieldAsTouched = (path: PropertyPath) => {
    touchedFields.value?.add(getPathAsString(path))
  }

  const isFieldTouched = (path: PropertyPath) => {
    return touchedFields.value?.has(getPathAsString(path))
  }

  const setAllFieldsAsTouched = () => {
    for (const key of controlsCache.keys()) {
      touchedFields.value.add(key)
    }
  }

  let validationGeneration = 0

  const runValidation = async () => {
    const schema = toValue(validationSchema)
    if (!schema) {
      console.warn(
        "[vue-reactive-form] No validation schema provided. Skipping validation."
      )
      return {
        skipped: true as const,
        state: state.value as unknown as TValidatedState
      }
    }

    const currentGeneration = ++validationGeneration

    const result = await standardValidate(schema, state.value)

    // A newer validation was started while this one was in flight — discard
    if (currentGeneration !== validationGeneration) {
      return { stale: true as const }
    }

    return result
  }

  const validate = async () => {
    const result = await runValidation()

    if ("skipped" in result) return result.state
    if ("stale" in result) return

    errors.value = {}

    if (!result.success) {
      errors.value = buildErrorsObject(result.issues)
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
      errors.value[pathStr] = allErrors[pathStr] ?? []
    } else {
      delete errors.value[pathStr]
    }
  }

  return {
    state,
    defaultFormState,
    errors,
    controlsCache,
    setFieldState,
    setFieldErrors,
    setFieldAsTouched,
    setAllFieldsAsTouched,
    getFieldState,
    getFieldErrors,
    isFieldTouched,
    validate,
    validateField,
    validateOn
  }
}
