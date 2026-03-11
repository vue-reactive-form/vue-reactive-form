import { groupBy } from "lodash-es"
import { toValue } from "@vue/reactivity"
import type {
  FormRoot,
  HandleSubmitOptions,
  UseFormOptions
} from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"
import { standardValidate } from "./validation"
import { useFormContext } from "./useFormContext"

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const { validationSchema } = options

  const formContext = useFormContext(defaultState)
  const { state, errors } = formContext

  const form = createControlsTree(formContext)

  const validate = async () => {
    const schema = toValue(validationSchema)
    if (!schema) {
      console.warn(
        "[vue-reactive-form] No validation schema provided. Skipping validation."
      )
      return state.value as unknown as TValidatedState // FIXME!!
    }

    errors.value = {}

    const result = await standardValidate(schema, state.value)

    if (!result.success) {
      errors.value = groupBy(
        result.issues,
        (issue) => `${issue.path.join(".")}`
      )
    } else {
      return result.output
    }
  }

  const handleSubmit = (options: HandleSubmitOptions<TValidatedState> = {}) => {
    const { onSuccess, onError } = options

    return async (event?: Event) => {
      event?.preventDefault()

      formContext.setAllFieldsAsTouched()

      const validationResult = await validate()

      if (validationResult) {
        onSuccess?.(validationResult)
      } else {
        onError?.(errors.value)
      }
    }
  }

  return {
    form,
    errors,
    validate,
    handleSubmit
  }
}
