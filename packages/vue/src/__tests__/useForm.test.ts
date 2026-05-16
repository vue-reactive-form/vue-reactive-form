import { describe, it, expect } from "vitest"
import * as yup from "yup"
import { useForm } from "../index"

describe("useForm > field (Vue extension)", () => {
  describe("v-model binding", () => {
    it("exposes the current state as modelValue", () => {
      const { form } = useForm({ name: "John" })

      expect(form.name.$control.field.modelValue).toBe("John")
    })

    it("updates state via 'onUpdate:modelValue'", () => {
      const { form } = useForm({ name: "John" })

      form.name.$control.field["onUpdate:modelValue"]("Jane")

      expect(form.name.$control.state).toBe("Jane")
      expect(form.name.$control.field.modelValue).toBe("Jane")
    })

    it("reflects external state changes in modelValue (reactive getter)", () => {
      const { form } = useForm({ name: "initial" })

      form.name.$control.state = "changed"

      expect(form.name.$control.field.modelValue).toBe("changed")
    })

    it("marks the control as dirty when updated via 'onUpdate:modelValue'", () => {
      const { form } = useForm({ name: "original" })

      expect(form.name.$control.dirty).toBe(false)

      form.name.$control.field["onUpdate:modelValue"]("modified")

      expect(form.name.$control.dirty).toBe(true)
    })

    it("handles undefined values", () => {
      const { form } = useForm<{ name: string }>({ name: "hello" })

      form.name.$control.field["onUpdate:modelValue"](undefined)

      expect(form.name.$control.state).toBe(undefined)
      expect(form.name.$control.field.modelValue).toBe(undefined)
    })

    it("works with nested object paths", () => {
      const { form } = useForm({ user: { name: "John" } })

      expect(form.user.name.$control.field.modelValue).toBe("John")

      form.user.name.$control.field["onUpdate:modelValue"]("Jane")

      expect(form.user.name.$control.state).toBe("Jane")
      expect(form.user.name.$control.field.modelValue).toBe("Jane")
    })
  })

  describe("onFocus / onBlur behavior", () => {
    it("marks the field as touched on focus", () => {
      const { form } = useForm({ name: "John" })

      expect(form.name.$control.touched).toBe(false)

      form.name.$control.field.onFocus()

      expect(form.name.$control.touched).toBe(true)
    })

    it("triggers validation on blur when validateOn is 'blur'", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required")
      })
      const { form, meta } = useForm(
        { name: "", email: "" },
        { validationSchema: schema, validateOn: "blur" }
      )

      form.name.$control.field.onFocus()
      await form.name.$control.field.onBlur()

      expect(meta.errors.name).toBeDefined()
    })

    it("only updates the blurred field's errors (others stay untouched)", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required"),
        email: yup.string().email("Invalid email").required("Email is required")
      })
      const { form, meta } = useForm(
        { name: "", email: "" },
        { validationSchema: schema, validateOn: "blur" }
      )

      form.name.$control.field.onFocus()
      await form.name.$control.field.onBlur()

      expect(meta.errors.name).toBeDefined()
      expect(meta.errors.email).toBeUndefined()
    })

    it("does not trigger validation on blur when validateOn is 'submit'", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required")
      })
      const { form, meta } = useForm(
        { name: "" },
        { validationSchema: schema, validateOn: "submit" }
      )

      form.name.$control.field.onFocus()
      await form.name.$control.field.onBlur()

      expect(meta.errors.name).toBeUndefined()
    })

    it("discards stale validation when a newer blur fires", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required")
      })
      const { form } = useForm(
        { name: "" },
        { validationSchema: schema, validateOn: "blur" }
      )

      form.name.$control.field.onFocus()
      const firstBlur = form.name.$control.field.onBlur()

      form.name.$control.state = "John"
      form.name.$control.field.onFocus()
      const secondBlur = form.name.$control.field.onBlur()

      await firstBlur
      await secondBlur

      expect(form.name.$control.isValid).toBe(true)
      expect(form.name.$control.errorMessages).toEqual([])
    })
  })
})
