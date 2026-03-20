import { describe, it, expect } from "vitest"
import { useFormContext } from "../useFormContext"
import { createArrayInputControl } from "../arrayInputControl"

describe("createArrayInputControl", () => {
  describe("add method", () => {
    it("should add an item with a default value to the array", () => {
      const context = useFormContext([1, 2, 3])

      const control = createArrayInputControl(context)

      control.add(4)
      expect(control.state).toEqual([1, 2, 3, 4])
      expect(control.dirty).toBe(true)
    })

    it("should add an item without a default value (undefined) to the array", () => {
      const context = useFormContext([1, 2, 3])

      const control = createArrayInputControl(context)

      control.add()
      expect(control.state).toEqual([1, 2, 3, undefined])
      expect(control.dirty).toBe(true)
    })

    it("should add objects to an array", () => {
      const context = useFormContext([{ name: "John" }, { name: "Jane" }])

      const control = createArrayInputControl(context)

      control.add({ name: "Bob" })
      expect(control.state).toEqual([
        { name: "John" },
        { name: "Jane" },
        { name: "Bob" }
      ])
      expect(control.dirty).toBe(true)
    })

    it("should add empty object to an array", () => {
      const context = useFormContext([{ name: "John" }, { name: "Jane" }])

      const control = createArrayInputControl(context)

      control.add({})
      expect(control.state).toEqual([
        { name: "John" },
        { name: "Jane" },
        {}
      ])
      expect(control.dirty).toBe(true)
    })

    it("should handle adding to an empty array", () => {
      const context = useFormContext([])

      const control = createArrayInputControl(context)

      control.add("first item")
      expect(control.state).toEqual(["first item"])
      expect(control.dirty).toBe(true)
    })

    it("should handle adding when state is undefined", () => {
      const context = useFormContext(undefined)

      const control = createArrayInputControl(context)

      control.add("item")
      expect(control.state).toEqual(["item"])
    })
  })

  describe("remove method", () => {
    it("should remove an item at the specified index", () => {
      const context = useFormContext([1, 2, 3, 4])

      const control = createArrayInputControl(context)

      control.remove(1) // Remove element at index 1 (value 2)
      expect(control.state).toEqual([1, 3, 4])
      expect(control.dirty).toBe(true)
    })

    it("should remove the first item", () => {
      const context = useFormContext(["a", "b", "c"])

      const control = createArrayInputControl(context)

      control.remove(0)
      expect(control.state).toEqual(["b", "c"])
      expect(control.dirty).toBe(true)
    })

    it("should remove the last item", () => {
      const context = useFormContext(["a", "b", "c"])

      const control = createArrayInputControl(context)

      control.remove(2)
      expect(control.state).toEqual(["a", "b"])
      expect(control.dirty).toBe(true)
    })

    it("should remove objects from an array", () => {
      const context = useFormContext([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])

      const control = createArrayInputControl(context)

      control.remove(1) // Remove Jane
      expect(control.state).toEqual([
        { id: 1, name: "John" },
        { id: 3, name: "Bob" }
      ])
      expect(control.dirty).toBe(true)
    })

    it("should handle removing from a single-item array", () => {
      const context = useFormContext(["only item"])

      const control = createArrayInputControl(context)

      control.remove(0)
      expect(control.state).toEqual([])
      expect(control.dirty).toBe(true)
    })

    it("should handle removing when state is undefined", () => {
      const context = useFormContext(undefined)

      const control = createArrayInputControl(context)

      // Should not throw an error
      control.remove(0)
      expect(control.state).toBe(undefined)
    })
  })

  describe("moveItem method", () => {
    it("should move an item from one index to another", () => {
      const context = useFormContext(["a", "b", "c", "d"])

      const control = createArrayInputControl(context)

      control.moveItem(0, 2) // Move "a" from index 0 to index 2
      expect(control.state).toEqual(["b", "c", "a", "d"])
      expect(control.dirty).toBe(true)
    })

    it("should move an item forward in the array", () => {
      const context = useFormContext([1, 2, 3, 4, 5])

      const control = createArrayInputControl(context)

      control.moveItem(1, 3) // Move element at index 1 to index 3
      expect(control.state).toEqual([1, 3, 4, 2, 5])
      expect(control.dirty).toBe(true)
    })

    it("should move an item backward in the array", () => {
      const context = useFormContext([1, 2, 3, 4, 5])

      const control = createArrayInputControl(context)

      control.moveItem(3, 1) // Move element at index 3 to index 1
      expect(control.state).toEqual([1, 4, 2, 3, 5])
      expect(control.dirty).toBe(true)
    })

    it("should handle moving to the same index (no change)", () => {
      const context = useFormContext(["a", "b", "c"])

      const control = createArrayInputControl(context)

      control.moveItem(1, 1) // Move item at index 1 to index 1
      expect(control.state).toEqual(["a", "b", "c"])
      expect(control.dirty).toBe(false)
    })

    it("should not be dirty when mutations restore the original state", () => {
      const context = useFormContext(["a", "b", "c"])

      const control = createArrayInputControl(context)

      // Add then remove — net effect is the original array
      control.add("d")
      expect(control.dirty).toBe(true)
      control.remove(3)
      expect(control.state).toEqual(["a", "b", "c"])
      expect(control.dirty).toBe(false)

      // Move forward then move back — net effect is the original array
      control.moveItem(0, 2)
      expect(control.dirty).toBe(true)
      control.moveItem(2, 0)
      expect(control.state).toEqual(["a", "b", "c"])
      expect(control.dirty).toBe(false)
    })

    it("should move objects in an array", () => {
      const context = useFormContext([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" }
      ])

      const control = createArrayInputControl(context)

      control.moveItem(0, 2) // Move John from first to last position
      expect(control.state).toEqual([
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" },
        { id: 1, name: "John" }
      ])
      expect(control.dirty).toBe(true)
    })

    it("should clamp indices to array bounds", () => {
      const context = useFormContext(["a", "b", "c"])

      const control = createArrayInputControl(context)

      // -1 clamps to 0, 10 clamps to 2 — equivalent to moveItem(0, 2)
      control.moveItem(-1, 10)
      expect(control.state).toEqual(["b", "c", "a"])
      expect(control.dirty).toBe(true)
    })

    it("should handle moving in a two-element array", () => {
      const context = useFormContext(["first", "second"])

      const control = createArrayInputControl(context)

      control.moveItem(0, 1) // Swap elements
      expect(control.state).toEqual(["second", "first"])
      expect(control.dirty).toBe(true)
    })

    it("should handle moving when state is undefined", () => {
      const context = useFormContext(undefined)

      const control = createArrayInputControl(context)

      // Should not throw an error
      control.moveItem(0, 1)
      expect(control.state).toBe(undefined)
    })
  })
})
