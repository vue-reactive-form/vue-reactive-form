import { describe, it, expect } from "vitest"
import { effect } from "@vue/reactivity"
import { vueAdapter } from "../adapter"
import type { Cell } from "@nano-form/core"

describe("vueAdapter.setIn", () => {
  it("mutates the inner object in place — stable reference identity", () => {
    const cell = vueAdapter.cell({ a: 1, b: 2 })
    const before = vueAdapter.get(cell)

    vueAdapter.setIn(cell, ["a"], 99)

    expect(vueAdapter.get(cell)).toBe(before)
    expect(vueAdapter.get(cell)).toEqual({ a: 99, b: 2 })
  })

  it("only invalidates effects subscribed to the touched path", () => {
    const cell = vueAdapter.cell({ a: 1, b: 2 })
    let readsA = 0
    let readsB = 0

    effect(() => {
      void vueAdapter.get(cell).a
      readsA++
    })
    effect(() => {
      void vueAdapter.get(cell).b
      readsB++
    })

    expect(readsA).toBe(1)
    expect(readsB).toBe(1)

    vueAdapter.setIn(cell, ["a"], 99)

    expect(readsA).toBe(2)
    expect(readsB).toBe(1) // would be 2 with clone-and-replace
  })

  it("supports nested paths", () => {
    const cell = vueAdapter.cell({ user: { name: "John", age: 30 } }) as Cell<{
      user: { name: string; age: number }
    }>
    const userBefore = vueAdapter.get(cell).user

    vueAdapter.setIn(cell, ["user", "name"], "Jane")

    expect(vueAdapter.get(cell).user).toBe(userBefore) // nested object identity preserved too
    expect(vueAdapter.get(cell).user.name).toBe("Jane")
    expect(vueAdapter.get(cell).user.age).toBe(30)
  })

  it("supports array element mutation", () => {
    const cell = vueAdapter.cell({ tags: ["a", "b", "c"] })

    vueAdapter.setIn(cell, ["tags", 1], "B")

    expect(vueAdapter.get(cell).tags).toEqual(["a", "B", "c"])
  })

  it("a nested setIn does not invalidate effects on a sibling subtree", () => {
    const cell = vueAdapter.cell({
      user: { name: "John" },
      address: { city: "Paris" }
    })
    let userReads = 0
    let addressReads = 0

    effect(() => {
      void vueAdapter.get(cell).user.name
      userReads++
    })
    effect(() => {
      void vueAdapter.get(cell).address.city
      addressReads++
    })

    vueAdapter.setIn(cell, ["user", "name"], "Jane")

    expect(userReads).toBe(2)
    expect(addressReads).toBe(1)
  })
})
