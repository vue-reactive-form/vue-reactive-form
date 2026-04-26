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
}
