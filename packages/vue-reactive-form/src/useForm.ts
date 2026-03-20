import type {
  FormRoot,
  HandleSubmitOptions,
  UseFormOptions
} from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"
import { useFormContext } from "./useFormContext"

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const formContext = useFormContext(defaultState, options)
  const { errors, validate } = formContext

  const form = createControlsTree(formContext)

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
