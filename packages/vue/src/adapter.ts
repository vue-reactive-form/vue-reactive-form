import { ref, type Ref } from "@vue/reactivity"
import { resolveUpdater, type Cell, type ReactivityAdapter, type Updater } from "@nano-form/core"

export const vueAdapter: ReactivityAdapter = {
  cell: <T>(initialValue: T) => ref(initialValue) as unknown as Cell<T>,

  get: <T>(cell: Cell<T>) => (cell as unknown as Ref<T>).value,

  update: <T>(cell: Cell<T>, updater: Updater<T>) => {
    const r = cell as unknown as Ref<T>
    r.value = resolveUpdater(updater, r.value)
  }
}
