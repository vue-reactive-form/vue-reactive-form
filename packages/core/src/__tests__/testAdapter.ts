import { resolveUpdater, type Cell, type ReactivityAdapter, type Updater } from "../types/adapter"

type PlainCell<T> = { value: T }

export const testAdapter: ReactivityAdapter = {
  cell: <T>(initialValue: T): Cell<T> =>
    ({ value: initialValue }) as unknown as Cell<T>,

  get: <T>(cell: Cell<T>): T =>
    (cell as unknown as PlainCell<T>).value,

  update: <T>(cell: Cell<T>, updater: Updater<T>): void => {
    const c = cell as unknown as PlainCell<T>
    c.value = resolveUpdater(updater, c.value)
  }
}
