import { cloneDeep, type PropertyPath } from "lodash-es"
import { isDirty } from "./utils"
import type {
  BaseInputControl,
  FieldBinding,
  InputControl
} from "./types/controls"
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
    validateOn,
    createControlExtension
  } = context

  const baseControl: BaseInputControl<TState> = {
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
      return isDirty(baseControl.state, baseControl.defaultState)
    },
    get touched() {
      return isFieldTouched(path)
    },
    get errorMessages() {
      return getFieldErrors(path).map((issue) => issue.message)
    },
    get isValid() {
      return baseControl.errorMessages.length === 0
    },
    clear() {
      baseControl.state = undefined
    },
    reset() {
      baseControl.state = cloneDeep(baseControl.defaultState)
    },
    updateDefaultState(newDefaultState?: PartialOrPrimitive<TState>) {
      setFieldState(path, newDefaultState, "default")
    },
    setAsTouched() {
      setFieldAsTouched(path)
    },
    validate() {
      return validateField(path)
    }
  }

  // Pre-wired binding handed to the extension factory.
  // `value` is a getter so adapters that read it inside their own getters stay reactive.
  const binding: FieldBinding<TState> = {
    get value() {
      return baseControl.state
    },
    onChange: (value) => {
      baseControl.state = value
    },
    onFocus: () => baseControl.setAsTouched(),
    onBlur: () => {
      if (validateOn === "blur") {
        return validateField(path)
      }
    }
  }

  if (createControlExtension) {
    const extension = createControlExtension(baseControl, binding)
    // defineProperties preserves any getters/setters defined on the extension,
    // which a plain spread or Object.assign would invoke and snapshot.
    Object.defineProperties(
      baseControl,
      Object.getOwnPropertyDescriptors(extension)
    )
  }

  return baseControl as InputControl<TState>
}
