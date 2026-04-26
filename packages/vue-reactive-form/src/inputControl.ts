import { cloneDeep, type PropertyPath } from "lodash-es"
import { isDirty } from "./utils"
import type { InputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"

export const createInputControl = <TState>(
  context: Omit<FormContext<unknown>, "controlsCache">,
  path: PropertyPath = []
): InputControl<TState> => {
  const {
    setFieldState,
    getFieldState,
    getFieldErrors,
    isFieldTouched,
    setFieldAsTouched,
    validateField,
    validateOn
  } = context

  const control: InputControl<TState> = {
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
      return isDirty(control.state, control.defaultState)
    },
    get touched() {
      return isFieldTouched(path)
    },
    get errorMessages() {
      return getFieldErrors(path).map((issue) => issue.message)
    },
    get isValid() {
      return control.errorMessages.length === 0
    },
    clear() {
      control.state = undefined
    },
    reset() {
      control.state = cloneDeep(control.defaultState)
    },
    updateDefaultState(newDefaultState?: PartialOrPrimitive<TState>) {
      setFieldState(path, newDefaultState, "default")
    },
    setAsTouched() {
      setFieldAsTouched(path)
    },
    validate() {
      return validateField(path)
    },
    get field() {
      return {
        modelValue: control.state,
        "onUpdate:modelValue": (
          value: PartialOrPrimitive<TState> | undefined
        ) => {
          control.state = value
        },
        onFocus: () => control.setAsTouched(),
        onBlur: () => {
          if (validateOn === "blur") {
            return validateField(path)
          }
        }
      }
    }
  }

  return control
}
