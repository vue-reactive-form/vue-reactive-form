import type {
  FormRoot,
  HandleSubmitOptions,
  UseFormContextOptions
} from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import type { ReactivityAdapter } from "./types/adapter"
import { createControlsTree } from "./controlsTree"
import { useFormContext } from "./useFormContext"

export const createUseForm =
  (adapter: ReactivityAdapter) =>
  <TState, TValidatedState = TState>(
    defaultState?: PartialOrPrimitive<TState>,
    options: UseFormContextOptions<TState, TValidatedState> = {}
  ): FormRoot<TState, TValidatedState> => {
    const formContext = useFormContext(adapter, defaultState, options)
    const { validate, meta, setAllFieldsAsTouched, onSubmitStart, onSubmitEnd } =
      formContext

    const form = createControlsTree(formContext)

    const handleSubmit = (options: HandleSubmitOptions<TValidatedState> = {}) => {
      const { onSuccess, onError } = options

      return async (event?: Event) => {
        event?.preventDefault()

        setAllFieldsAsTouched()
        onSubmitStart()

        try {
          const validationResult = await validate()

          if (validationResult) {
            onSuccess?.(validationResult)
          } else {
            onError?.(meta.errors)
          }
        } finally {
          onSubmitEnd()
        }
      }
    }

    return {
      form,
      meta,
      validate,
      handleSubmit
    }
  }
