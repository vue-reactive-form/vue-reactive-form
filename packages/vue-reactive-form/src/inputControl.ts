import { isEqual, isObject, type PropertyPath } from "lodash-es"
import { deepPick } from "./utils"
import type { InputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"

const isDirty = (value: unknown, defaultValue: unknown) => {
  /**
   * When inputs are objects we filter them of possibly undefined values to avoid false positives, that might occur
   * when some property is not defined in some cases, and there but with value of `undefined` in some others
   */
  if (isObject(value) && isObject(defaultValue)) {
    return !isEqual(
      deepPick(value, (v) => v !== undefined),
      deepPick(defaultValue, (v) => v !== undefined)
    )
  }

  return !isEqual(value, defaultValue)
}

export const createInputControl = <TState>(
  context: Omit<FormContext<unknown>, "controlsCache">,
  path: PropertyPath = []
): InputControl<TState> => {
  const {
    setFieldState,
    getFieldState,
    getFieldErrors,
    isFieldTouched,
    setFieldAsTouched
  } = context

  return {
    get state() {
      return getFieldState(path, "current")
    },
    set state(value: PartialOrPrimitive<TState> | undefined) {
      setFieldState(path, value, "current")
    },

    get defaultState() {
      return getFieldState(path, "default")
    },
    get dirty() {
      return isDirty(
        getFieldState(path, "current"),
        getFieldState(path, "default")
      )
    },
    get touched() {
      return isFieldTouched(path)
    },
    get isValid() {
      const issues = getFieldErrors(path)
      return issues.length === 0
    },
    get errorMessages() {
      const issues = getFieldErrors(path)
      return issues.map((issue) => issue.message)
    },
    clear() {
      setFieldState(path, undefined, "current")
    },
    reset() {
      setFieldState(path, getFieldState(path, "default"), "current")
    },
    updateDefaultState(newDefaultState?: PartialOrPrimitive<TState>) {
      setFieldState(path, newDefaultState, "default")
    },
    setAsTouched() {
      setFieldAsTouched(path)
    }
  }
}
