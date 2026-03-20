import { createArrayInputControl } from "./arrayInputControl"
import { get } from "lodash-es"
import type { InputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"

const getInputControl = (
  context: FormContext<unknown, unknown>,
  path: (string | number | symbol)[]
) => {
  const { controlsCache } = context
  const concatenatedPath: string = path.join(".")

  if (!controlsCache.has(concatenatedPath)) {
    controlsCache.set(
      concatenatedPath,
      createArrayInputControl(context, path) as InputControl<unknown>
    )
  }

  return controlsCache.get(concatenatedPath)
}

export const createControlsTree = <TState, TValidatedState = TState>(context: FormContext<TState, TValidatedState>) => {
  const { state: formState } = context
  const buildProxyHandler = (path: (string | number | symbol)[] = []) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, handlerPath: string | number | symbol) {
      const fullPath = [...path, handlerPath]

      if (handlerPath === Symbol.iterator) {
        return function* () {
          const array = get(formState.value, path) ?? []
          for (let i = 0; i < array.length; i++) {
            const iteratorPath = [...path, i]
            target[i] = buildProxyControl(context, iteratorPath)
            yield target[i]
          }
        }
      }

      if (!Reflect.get(target, handlerPath)) {
        Reflect.set(target, handlerPath, buildProxyControl(context, fullPath))
      }

      return Reflect.get(target, handlerPath)
    }
  })

  const buildProxyControl = (
    context: FormContext<TState, TValidatedState>,
    path: (string | number | symbol)[]
  ) => {
    return new Proxy(
      {
        $control: getInputControl(context as FormContext<unknown, unknown>, path)
      },
      buildProxyHandler(path)
    )
  }

  return buildProxyControl(context, [])
}
