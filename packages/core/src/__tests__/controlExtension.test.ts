import { describe, it, expect } from "vitest"
import * as yup from "yup"
import { createUseForm } from "../useForm"
import { testAdapter } from "./testAdapter"
import type {
  BaseInputControl,
  ControlExtension,
  CreateControlExtension,
  FieldBinding
} from "../types/controls"

// Per-test declaration merging so the captured binding/baseControl become
// readable from the user-facing control without casts.
declare module "../types/controls" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ControlExtension<T> {
    _binding?: FieldBinding<T>
    _base?: BaseInputControl<T>
  }
}

const captureExtension: CreateControlExtension = (control, binding) => ({
  _binding: binding,
  _base: control
})

describe("control extension mechanism", () => {
  it("does not add any extension properties when no factory is provided", () => {
    const useForm = createUseForm(testAdapter)
    const { form } = useForm({ name: "John" })

    expect(form.name.$control._binding).toBeUndefined()
    expect(form.name.$control._base).toBeUndefined()
  })

  it("merges every property returned by the factory onto each control", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ name: "John" })

    expect(form.name.$control._binding).toBeDefined()
    expect(form.name.$control._base).toBeDefined()
  })

  it("passes a binding whose value reflects current state reactively", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ name: "John" })

    const binding = form.name.$control._binding!
    expect(binding.value).toBe("John")

    form.name.$control.state = "Jane"
    expect(binding.value).toBe("Jane")
  })

  it("passes a binding whose onChange updates the underlying state", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ name: "John" })

    form.name.$control._binding!.onChange("Jane")
    expect(form.name.$control.state).toBe("Jane")
  })

  it("passes a binding whose onFocus marks the field as touched", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ name: "John" })

    expect(form.name.$control.touched).toBe(false)
    form.name.$control._binding!.onFocus()
    expect(form.name.$control.touched).toBe(true)
  })

  it("passes a binding whose onBlur triggers validation when validateOn is 'blur'", async () => {
    const schema = yup.object({ name: yup.string().required("Required") })
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form, meta } = useForm(
      { name: "" },
      { validationSchema: schema, validateOn: "blur" }
    )

    await form.name.$control._binding!.onBlur()
    expect(meta.errors.name).toBeDefined()
  })

  it("passes a binding whose onBlur is a no-op when validateOn is 'submit'", async () => {
    const schema = yup.object({ name: yup.string().required("Required") })
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form, meta } = useForm(
      { name: "" },
      { validationSchema: schema, validateOn: "submit" }
    )

    await form.name.$control._binding!.onBlur()
    expect(meta.errors.name).toBeUndefined()
  })

  it("hands the factory a base control whose getters track state changes", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ name: "John" })

    const base = form.name.$control._base!
    expect(base.state).toBe("John")
    expect(base.dirty).toBe(false)

    form.name.$control.state = "Jane"
    expect(base.state).toBe("Jane")
    expect(base.dirty).toBe(true)
  })

  it("preserves getters defined on the extension via defineProperties", () => {
    let reads = 0
    const useForm = createUseForm(testAdapter, (_control, binding) => ({
      get _binding() {
        reads++
        return binding
      }
    }))
    const { form } = useForm({ name: "John" })

    expect(reads).toBe(0)
    void form.name.$control._binding
    void form.name.$control._binding
    expect(reads).toBe(2) // confirms the getter was preserved, not snapshotted
  })

  it("applies the extension to array controls as well", () => {
    const useForm = createUseForm(testAdapter, captureExtension)
    const { form } = useForm({ tags: ["a", "b"] })

    expect(form.tags.$control._binding).toBeDefined()
    expect(form.tags[0]!.$control._binding).toBeDefined()
  })

  it("doesn't leak the binding onto BaseInputControl when no factory is provided", () => {
    const useForm = createUseForm(testAdapter)
    const { form } = useForm({ name: "John" })

    expect((form.name.$control as Record<string, unknown>).binding).toBeUndefined()
  })
})
