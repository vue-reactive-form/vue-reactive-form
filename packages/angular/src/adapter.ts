import { signal, type Signal, type WritableSignal } from "@angular/core"
import {
  createImmutableSetIn,
  resolveUpdater,
  type Cell,
  type ReactivityAdapter,
  type Updater
} from "@nano-form/core"

const _get = <T>(cell: Cell<T>): T => (cell as unknown as Signal<T>)()

const _update = <T>(cell: Cell<T>, updater: Updater<T>): void => {
  const s = cell as unknown as WritableSignal<T>
  s.set(resolveUpdater(updater, s()))
}

// Angular Signals track whole-value reads, not sub-paths, so setIn uses
// clone-and-replace via createImmutableSetIn.
export const angularAdapter: ReactivityAdapter = {
  cell: <T>(initialValue: T): Cell<T> =>
    signal(initialValue) as unknown as Cell<T>,

  get: _get,

  update: _update,

  setIn: createImmutableSetIn(_get, _update)
}
