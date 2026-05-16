import { describe, it, expect } from "vitest"
import {
  createImmutableSetIn,
  type Cell,
  type ReactivityAdapter
} from "../types/adapter"

describe("createImmutableSetIn", () => {
  it("publishes the change through update so subscribers see the new value", () => {
    let writes = 0
    const get: ReactivityAdapter["get"] = (cell) =>
      (cell as unknown as { value: unknown }).value as never
    const update: ReactivityAdapter["update"] = (cell, updater) => {
      const c = cell as unknown as { value: unknown }
      c.value =
        typeof updater === "function" ? (updater as Function)(c.value) : updater
      writes++
    }
    const setIn = createImmutableSetIn(get, update)

    const cell = { value: { a: 1, b: 2 } } as unknown as Cell<{
      a: number
      b: number
    }>
    setIn(cell, ["a"], 99)

    expect(get(cell)).toEqual({ a: 99, b: 2 })
    expect(writes).toBe(1)
  })

  it("does not mutate the previous value object (immutable contract)", () => {
    const get: ReactivityAdapter["get"] = (cell) =>
      (cell as unknown as { value: unknown }).value as never
    const update: ReactivityAdapter["update"] = (cell, updater) => {
      const c = cell as unknown as { value: unknown }
      c.value =
        typeof updater === "function" ? (updater as Function)(c.value) : updater
    }
    const setIn = createImmutableSetIn(get, update)

    const original = { a: 1, b: 2 }
    const cell = { value: original } as unknown as Cell<{
      a: number
      b: number
    }>
    setIn(cell, ["a"], 99)

    expect(original).toEqual({ a: 1, b: 2 })
    expect(get(cell)).not.toBe(original)
  })
})
