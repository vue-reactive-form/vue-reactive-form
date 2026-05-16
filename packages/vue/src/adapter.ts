import { ref, type Ref } from "@vue/reactivity"
import { set } from "lodash-es"
import {
  resolveUpdater,
  type Cell,
  type ReactivityAdapter,
  type Updater
} from "@nano-form/core"

export const vueAdapter: ReactivityAdapter = {
  cell: <T>(initialValue: T) => ref(initialValue) as unknown as Cell<T>,

  get: <T>(cell: Cell<T>) => (cell as unknown as Ref<T>).value,

  update: <T>(cell: Cell<T>, updater: Updater<T>) => {
    const r = cell as unknown as Ref<T>
    r.value = resolveUpdater(updater, r.value)
  },

  // ref({...}).value is already a deep `reactive` proxy in Vue, so mutating
  // it in place publishes a fine-grained change. Subscribers reading other
  // paths stay valid; only the touched path's deps re-evaluate.
  setIn: (cell, path, value) => {
    set((cell as unknown as Ref<object>).value, path, value)
  }
}
