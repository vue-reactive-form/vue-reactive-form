import { describe, it, expect } from "vitest"
import { deepPick } from "../utils"

describe("deepPick", () => {
  it("should pick values matching the condition at the root level", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deepPick(obj, (v, k) => v === 2 || k === "c")
    expect(result).toEqual({ b: 2, c: 3 })
  })

  it("should pick deeply nested values matching the condition", () => {
    const obj = { a: { b: { c: 1 }, d: 2 }, e: 3 }
    const result = deepPick(obj, (v, k) => k === "c" || v === 3)
    expect(result).toEqual({ a: { b: { c: 1 } }, e: 3 })
  })

  it("should handle arrays within objects", () => {
    const obj = { a: [{ b: 1 }, { b: 2 }], c: 3 }
    const result = deepPick(obj, (v, k) => v === 2 || k === "c")
    expect(result).toEqual({ a: [undefined, { b: 2 }], c: 3 })
  })

  it("should not pick values if none match the condition", () => {
    const obj = { a: 1, b: { c: 2 } }
    const result = deepPick(obj, () => false)
    expect(result).toEqual({})
  })

  it("should handle null values", () => {
    const obj = { a: null, b: 1, c: 3 }
    const result = deepPick(obj, (v) => v == null)
    expect(result).toEqual({ a: null })
  })

  it("should handle undefined values", () => {
    const obj = { a: undefined, b: 2, c: { d: undefined, e: 3 } }
    const result = deepPick(obj, (v) => v === undefined)
    expect(result).toEqual({ a: undefined, c: { d: undefined } })
  })

  it("should not treat Date objects as objects to recurse", () => {
    const date = new Date()
    const obj = { a: { b: date }, c: 2 }
    const result = deepPick(obj, (v) => v instanceof Date)
    expect(result).toEqual({ a: { b: date } })
  })

  it("should return an empty object for non-object input", () => {
    expect(deepPick(null, () => true)).toEqual({})
    expect(deepPick(undefined, () => true)).toEqual({})
    expect(deepPick(42, () => true)).toEqual({})
  })

  it("should work with arrays as root", () => {
    const arr = [{ a: 1 }, { a: 2 }]
    const result = deepPick(arr, (v) => v === 2)
    expect(result).toEqual([undefined, { a: 2 }])
  })

  it("should still keep empty objects in the result", () => {
    const obj = { a: {}, b: { c: 1 } }
    const result = deepPick(obj, (v) => v === 1)
    expect(result).toEqual({ a: {}, b: { c: 1 } })
  })

  it("should still keep empty arrays in the result", () => {
    const obj = { a: [], b: [1, 2, 3] }
    const result = deepPick(obj, (v) => v === 2)
    expect(result).toEqual({ a: [], b: [undefined, 2] })
  })
})
