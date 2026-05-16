import { describe, it, expect, vi } from "vitest"
import { toAngularField } from "../field"
import { angularAdapter } from "../adapter"
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

describe("toAngularField", () => {
  it("value() returns the current binding value", () => {
    const binding = makeBinding({ value: "hello" })
    const props = toAngularField(binding)

    expect(props.value()).toBe("hello")
  })

  it("forwards onChange", () => {
    const onChange = vi.fn()
    const binding = makeBinding<string>({ onChange })
    const props = toAngularField(binding)

    props.onChange("world")

    expect(onChange).toHaveBeenCalledWith("world")
  })

  it("forwards onFocus and onBlur unchanged", () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const props = toAngularField(makeBinding({ onFocus, onBlur }))

    props.onFocus()
    props.onBlur()

    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it("value() re-evaluates when the underlying signal changes", () => {
    const cell = angularAdapter.cell("initial")

    const binding: FieldBinding<string> = {
      get value() {
        return angularAdapter.get(cell) as string
      },
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {}
    }
    const props = toAngularField(binding)

    expect(props.value()).toBe("initial")

    angularAdapter.update(cell, "updated")

    expect(props.value()).toBe("updated")
  })
})
