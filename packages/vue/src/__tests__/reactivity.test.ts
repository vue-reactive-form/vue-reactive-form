import { describe, it, expect } from "vitest"
import { effect } from "@vue/reactivity"
import { useForm } from "../index"

describe("useForm > fine-grained reactivity", () => {
  it("a leaf v-model update does not invalidate sibling field bindings", () => {
    const { form } = useForm({ a: "x", b: "y" })

    let bReads = 0
    effect(() => {
      void form.b.$control.field.modelValue
      bReads++
    })

    expect(bReads).toBe(1)

    form.a.$control.field["onUpdate:modelValue"]("x2")

    expect(bReads).toBe(1)
  })

  it("a leaf v-model update re-evaluates exactly the touched binding once", () => {
    const { form } = useForm({ a: "x" })

    let aReads = 0
    effect(() => {
      void form.a.$control.field.modelValue
      aReads++
    })

    form.a.$control.field["onUpdate:modelValue"]("x2")

    expect(aReads).toBe(2)
  })

  it("a nested leaf update does not invalidate sibling subtree bindings", () => {
    const { form } = useForm({
      user: { name: "John" },
      address: { city: "Paris" }
    })

    let userReads = 0
    let cityReads = 0
    effect(() => {
      void form.user.name.$control.field.modelValue
      userReads++
    })
    effect(() => {
      void form.address.city.$control.field.modelValue
      cityReads++
    })

    form.user.name.$control.field["onUpdate:modelValue"]("Jane")

    expect(userReads).toBe(2)
    expect(cityReads).toBe(1)
  })

  it("an array element mutation does not invalidate sibling element bindings", () => {
    const { form } = useForm({ tags: ["a", "b", "c"] })

    let tag0Reads = 0
    let tag2Reads = 0
    effect(() => {
      void form.tags[0]!.$control.field.modelValue
      tag0Reads++
    })
    effect(() => {
      void form.tags[2]!.$control.field.modelValue
      tag2Reads++
    })

    form.tags[1]!.$control.field["onUpdate:modelValue"]("B")

    expect(tag0Reads).toBe(1)
    expect(tag2Reads).toBe(1)
  })

  it("a leaf update is observable through the form-level state inspector", () => {
    const { form } = useForm({ a: "x", b: "y" })

    let snapshots: Array<{ a?: string; b?: string }> = []
    effect(() => {
      snapshots.push({ ...form.$control.state })
    })

    form.a.$control.field["onUpdate:modelValue"]("x2")

    expect(snapshots).toEqual([
      { a: "x", b: "y" },
      { a: "x2", b: "y" }
    ])
  })
})
