import { ref, type Ref } from "@vue/reactivity"
import type { ControlsCache, FormContext, FormErrors } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { cloneDeep, get, set, type PropertyPath } from "lodash-es"
import type { ValidationIssue } from "./validation"

const getPathAsString = (path: PropertyPath) => {
  return Array.isArray(path) && path.length ? path.join(".") : ""
}

export const useFormContext = <TState>(
  defaultState?: PartialOrPrimitive<TState>
): FormContext<PartialOrPrimitive<TState>> => {
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
    isFieldTouched
  }
}
