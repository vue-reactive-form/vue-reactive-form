import { describe, it, expect } from "vitest"
import { angularAdapter } from "../adapter"
import type { Cell } from "@nano-form/core"

describe("angularAdapter.setIn", () => {
  it("updates the value at the given path", () => {
    const cell = angularAdapter.cell({ a: 1, b: 2 })

    angularAdapter.setIn(cell, ["a"], 99)

    expect(angularAdapter.get(cell)).toEqual({ a: 99, b: 2 })
  })

  it("leaves sibling keys unchanged", () => {
    const cell = angularAdapter.cell({ a: 1, b: 2 })

    angularAdapter.setIn(cell, ["a"], 99)

    expect(angularAdapter.get(cell).b).toBe(2)
  })

  it("supports nested paths", () => {
    const cell = angularAdapter.cell({
      user: { name: "John", age: 30 }
    }) as Cell<{ user: { name: string; age: number } }>

    angularAdapter.setIn(cell, ["user", "name"], "Jane")

    expect(angularAdapter.get(cell).user.name).toBe("Jane")
    expect(angularAdapter.get(cell).user.age).toBe(30)
  })

  it("supports array element mutation", () => {
    const cell = angularAdapter.cell({ tags: ["a", "b", "c"] })

    angularAdapter.setIn(cell, ["tags", 1], "B")

    expect(angularAdapter.get(cell).tags).toEqual(["a", "B", "c"])
  })
})

describe("angularAdapter.update", () => {
  it("replaces the value via a new value", () => {
    const cell = angularAdapter.cell(1)

    angularAdapter.update(cell, 2)

    expect(angularAdapter.get(cell)).toBe(2)
  })

  it("replaces the value via an updater function", () => {
    const cell = angularAdapter.cell(10)

    angularAdapter.update(cell, (v) => v + 5)

    expect(angularAdapter.get(cell)).toBe(15)
  })
})
