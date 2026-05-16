import { describe, it, expect, vi } from "vitest"
import { toVueField } from "../field"
import type { FieldBinding } from "@nano-form/core"

const makeBinding = <T>(
  overrides: Partial<FieldBinding<T>> = {}
): FieldBinding<T> => ({
  value: undefined,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  ...overrides
})

describe("toVueField", () => {
  it("exposes value via modelValue", () => {
    const binding = makeBinding({ value: "hello" })
    const props = toVueField(binding)

    expect(props.modelValue).toBe("hello")
  })

  it("forwards onChange via onUpdate:modelValue", () => {
    const onChange = vi.fn()
    const binding = makeBinding<string>({ onChange })
    const props = toVueField(binding)

    props["onUpdate:modelValue"]("world")

    expect(onChange).toHaveBeenCalledWith("world")
  })

  it("forwards onFocus and onBlur unchanged", () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const props = toVueField(makeBinding({ onFocus, onBlur }))

    props.onFocus()
    props.onBlur()

    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it("modelValue is a live getter — reflects later binding.value reads", () => {
    let current = "first"
    const binding: FieldBinding<string> = {
      get value() {
        return current
      },
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {}
    }
    const props = toVueField(binding)

    expect(props.modelValue).toBe("first")

    current = "second"

    expect(props.modelValue).toBe("second")
  })
})
