import { cloneDeep, set, type PropertyPath } from "lodash-es"

declare const _cell: unique symbol

export type Cell<T> = { readonly [_cell]: T }

export type MaybeGetter<T> = T | (() => T)

export const resolveGetter = <T>(maybeGetter: MaybeGetter<T>): T =>
  typeof maybeGetter === "function" ? (maybeGetter as () => T)() : maybeGetter

/**
 * Either a new value to set directly, or a function that transforms the current value.
 * Note: T must not itself be a function type, as the two cases are distinguished by typeof.
 */
export type Updater<T> = T | ((current: T) => T)

export const resolveUpdater = <T>(updater: Updater<T>, current: T): T =>
  typeof updater === "function" ? (updater as (current: T) => T)(current) : updater

export type ReactivityAdapter = {
  cell: <T>(initialValue: T) => Cell<T>
  get: <T>(cell: Cell<T>) => T
  update: <T>(cell: Cell<T>, updater: Updater<T>) => void
  /**
   * Mutate the value stored in `cell` at the given path.
   *
   * Core routes path-keyed state mutations (e.g. updating a single field
   * inside the form state) through this method instead of `update` so that
   * adapters with native path-level reactivity (Vue's deep proxy, MobX) can
   * publish a fine-grained change. Adapters without that capability should
   * use `createImmutableSetIn` to build a correct fallback.
   *
   * Whole-cell replacements (errors map, touched set, submit counters) still
   * go through `update`.
   */
  setIn: <T>(cell: Cell<T>, path: PropertyPath, value: unknown) => void
}

/**
 * Default `setIn` implementation for adapters whose reactivity system cannot
 * track mutations at a sub-path of a cell (signals, plain refs, anything
 * where a write is observed as a whole-value replacement).
 *
 * The returned function clones the current cell value, applies the mutation
 * at `path` on the clone, and republishes the new value through `update`.
 * This preserves the *observable* contract of `setIn` — the value at `path`
 * is updated and subscribers are notified — at the cost of allocating a new
 * top-level object. Subscribers tracking unrelated paths will still be
 * invalidated; that's inherent to the underlying reactivity system, not
 * something this fallback can fix.
 *
 * Adapters whose reactivity tracks sub-paths natively (e.g. Vue's deep
 * `reactive` proxy) should implement `setIn` directly by mutating in place,
 * not use this helper — otherwise they pay the clone cost and lose the
 * fine-grained tracking they were designed to provide.
 *
 * @example
 * ```ts
 * const cell = <T>(v: T) => ({ value: v }) as unknown as Cell<T>
 * const get = <T>(c: Cell<T>) => (c as unknown as { value: T }).value
 * const update = <T>(c: Cell<T>, u: Updater<T>) => {
 *   const r = c as unknown as { value: T }
 *   r.value = resolveUpdater(u, r.value)
 * }
 *
 * export const myAdapter: ReactivityAdapter = {
 *   cell, get, update,
 *   setIn: createImmutableSetIn(get, update),
 * }
 * ```
 */
export const createImmutableSetIn =
  (
    get: ReactivityAdapter["get"],
    update: ReactivityAdapter["update"]
  ): ReactivityAdapter["setIn"] =>
  (cell, path, value) => {
    const next = cloneDeep(get(cell)) as object
    set(next, path, value)
    update(cell, next as never)
  }
