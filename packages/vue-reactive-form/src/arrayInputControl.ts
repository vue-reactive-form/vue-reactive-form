import { createInputControl } from "./inputControl"
import type { PartialOrPrimitive } from "./types/utils"
import type { ArrayInputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"

export const createArrayInputControl = <TState extends Array<unknown>>(
  context: Omit<FormContext<unknown>, "controlsCache">,
  path: (string | number | symbol)[] = []
): ArrayInputControl<TState> => {
  const inputControl = createInputControl<TState>(context, path)

  const add = (defaultValue?: PartialOrPrimitive<TState[number]>) => {
    if (!inputControl.state) {
      inputControl.state = [] as unknown as PartialOrPrimitive<TState>
    }
    ;(inputControl.state as any[]).push(defaultValue as any)
  }

  const remove = (index: number) => {
    ;(inputControl.state as any[])?.splice(index, 1)
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    // Clamp indices to array bounds
    const currentState = (inputControl.state as any[]) ?? []
    const maxIndex = currentState.length - 1
    const start = Math.max(0, Math.min(maxIndex, fromIndex))
    const end = Math.max(0, Math.min(maxIndex, toIndex))

    // Remove the item
    const [item] = currentState.splice(start, 1)

    // Insert the item at the new position
    currentState.splice(end, 0, item)
  }

  return Object.assign(inputControl, {
    add,
    remove,
    moveItem
  })
}
