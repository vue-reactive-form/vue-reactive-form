import { describe, it, expect } from "vitest"
import * as yup from "yup"
import { createInputControl } from "../inputControl"
import { useFormContext } from "../useFormContext"

describe("createInputControl", () => {
  describe("When state is a primitive", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      expect(control.state).toBe("bar")
      expect(control.defaultState).toBe("bar")
      expect(control.dirty).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.state = "baz"
      expect(control.state).toBe("baz")
      expect(control.dirty).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext("bar")
      const { setFieldState } = context
      setFieldState([], "baz", "current")
      const control = createInputControl(context)

      control.state = "baz"
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe("bar")
      expect(control.dirty).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.clear()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      control.updateDefaultState("qux")
      expect(control.defaultState).toBe("qux")
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe("qux")
      expect(control.dirty).toBe(false)
    })

    it("should handle undefined initial values", () => {
      const context = useFormContext(undefined)

      const control = createInputControl(context)

      expect(control.state).toBe(undefined)
      expect(control.defaultState).toBe(undefined)
      expect(control.dirty).toBe(false)

      control.state = "something"
      expect(control.state).toBe("something")
      expect(control.dirty).toBe(true)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext("bar")
      const control = createInputControl(context)

      expect(control.dirty).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState).toBe(undefined)
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(false)
    })

    describe("validation properties", () => {
      it("should report isValid as true when there are no errors", () => {
        const context = useFormContext("valid value")
        const control = createInputControl(context)

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })

      it("should report isValid as false when there are errors", async () => {
        const schema = yup
          .string()
          .required("Value is required")
          .min(3, "Value must be at least 3 characters")
        const context = useFormContext("", { validationSchema: schema })
        const control = createInputControl(context)

        await context.validate()

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual([
          "Value is required",
          "Value must be at least 3 characters"
        ])
      })

      it("should react to changes in the errors state", async () => {
        const schema = yup.string().required("This field is invalid")
        const context = useFormContext("", { validationSchema: schema })
        const control = createInputControl(context)

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])

        // Validate — should fail
        await context.validate()

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual(["This field is invalid"])

        // Fix value and validate again — errors should clear
        control.state = "valid"
        await context.validate()

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })

      it("should clear error messages when updating the state", async () => {
        const schema = yup.string().required("Some error")
        const context = useFormContext("", { validationSchema: schema })
        const control = createInputControl(context)

        await context.validate()

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual(["Some error"])

        // Updating the state should clear errors without re-validating
        control.state = "new value"

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })

      it("should handle empty errors object gracefully", () => {
        const context = useFormContext("some value")

        const control = createInputControl(context)

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })

      it("should report isValid as true after successful validation", async () => {
        const schema = yup.string().required()
        const context = useFormContext("valid value", {
          validationSchema: schema
        })
        const control = createInputControl(context)

        await context.validate()

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })
    })

    describe("touched state", () => {
      it("should initially be untouched", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        expect(control.touched).toBe(false)
      })

      it("should become touched after calling setAsTouched", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        expect(control.touched).toBe(false)

        control.setAsTouched()

        expect(control.touched).toBe(true)
      })

      it("should remain touched after multiple setAsTouched calls", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        control.setAsTouched()
        control.setAsTouched()

        expect(control.touched).toBe(true)
      })

      it("should remain touched after state changes", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        control.setAsTouched()
        expect(control.touched).toBe(true)

        control.state = "new value"

        expect(control.touched).toBe(true)
      })

      it("should remain touched after reset", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        control.setAsTouched()
        control.state = "changed"
        control.reset()

        expect(control.touched).toBe(true)
      })

      it("should remain touched after clear", () => {
        const context = useFormContext("bar")
        const control = createInputControl(context)

        control.setAsTouched()
        control.clear()

        expect(control.touched).toBe(true)
      })
    })
  })

  describe("When validateOn is blur", () => {
    it("should trigger validation when field.onBlur is called", async () => {
      const context = useFormContext(
        { name: "" },
        {
          validationSchema: yup.object({
            name: yup.string().required("Required")
          }),
          validateOn: "blur"
        }
      )
      const control = createInputControl(context, ["name"])

      // Focus marks as touched, blur triggers validation
      control.field.onFocus()
      await control.field.onBlur()

      expect(context.errors.value.name).toBeDefined()
      expect(control.isValid).toBe(false)
      expect(control.errorMessages).toEqual(["Required"])
    })

    it("should not trigger validation on blur when validateOn is submit", async () => {
      const context = useFormContext(
        { name: "" },
        {
          validationSchema: yup.object({
            name: yup.string().required("Required")
          }),
          validateOn: "submit"
        }
      )
      const control = createInputControl(context, ["name"])

      await control.field.onBlur()

      // No validation should have run
      expect(context.errors.value.name).toBeUndefined()
    })

    it("should only update errors for the blurred field", async () => {
      const context = useFormContext(
        { name: "", age: 30 },
        {
          validationSchema: yup.object({
            name: yup.string().required("Name required"),
            age: yup.number().min(50, "Age invalid")
          }),
          validateOn: "blur"
        }
      )
      const nameControl = createInputControl(context, ["name"])
      const ageControl = createInputControl(context, ["age"])

      // Blur only the name field
      nameControl.field.onFocus()
      await nameControl.field.onBlur()

      // Name errors are written
      expect(nameControl.isValid).toBe(false)
      expect(nameControl.errorMessages).toEqual(["Name required"])

      // Age errors are NOT written — it was never blurred
      expect(ageControl.isValid).toBe(true)
      expect(ageControl.errorMessages).toEqual([])
    })

    it("should set touched on focus via field", () => {
      const context = useFormContext({ name: "John" })
      const control = createInputControl(context, ["name"])

      expect(control.touched).toBe(false)

      control.field.onFocus()

      expect(control.touched).toBe(true)
    })
  })

  describe("validate", () => {
    it("should trigger validation for the field", async () => {
      const context = useFormContext(
        { name: "" },
        {
          validationSchema: yup.object({
            name: yup.string().required("Required")
          })
        }
      )
      const control = createInputControl(context, ["name"])

      expect(control.isValid).toBe(true)

      await control.validate()

      expect(control.isValid).toBe(false)
      expect(control.errorMessages).toEqual(["Required"])
    })

    it("should only update errors for the validated field", async () => {
      const context = useFormContext(
        { name: "", age: 30 },
        {
          validationSchema: yup.object({
            name: yup.string().required("Name required"),
            age: yup.number().min(50, "Age invalid")
          })
        }
      )
      const nameControl = createInputControl(context, ["name"])
      const ageControl = createInputControl(context, ["age"])

      await nameControl.validate()

      expect(nameControl.isValid).toBe(false)
      expect(nameControl.errorMessages).toEqual(["Name required"])

      expect(ageControl.isValid).toBe(true)
      expect(ageControl.errorMessages).toEqual([])
    })

    it("should clear errors when validation passes after fix", async () => {
      const context = useFormContext(
        { name: "" },
        {
          validationSchema: yup.object({
            name: yup.string().required("Required")
          })
        }
      )
      const control = createInputControl(context, ["name"])

      await control.validate()
      expect(control.isValid).toBe(false)

      control.state = "valid"
      await control.validate()

      expect(control.isValid).toBe(true)
      expect(control.errorMessages).toEqual([])
    })
  })

  describe("field model binding", () => {
    it("should expose current state as modelValue", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      expect(control.field.modelValue).toBe("hello")
    })

    it("should update state via onUpdate:modelValue", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      control.field["onUpdate:modelValue"]("world")

      expect(control.state).toBe("world")
      expect(control.field.modelValue).toBe("world")
    })

    it("should reflect external state changes in modelValue", () => {
      const context = useFormContext("initial")
      const control = createInputControl(context)

      control.state = "changed"

      expect(control.field.modelValue).toBe("changed")
    })

    it("should work with nested object paths", () => {
      const context = useFormContext({ user: { name: "John" } })
      const control = createInputControl(context, ["user", "name"])

      expect(control.field.modelValue).toBe("John")

      control.field["onUpdate:modelValue"]("Jane")

      expect(control.state).toBe("Jane")
      expect(control.field.modelValue).toBe("Jane")
    })

    it("should mark field as dirty when updated via onUpdate:modelValue", () => {
      const context = useFormContext("original")
      const control = createInputControl(context)

      expect(control.dirty).toBe(false)

      control.field["onUpdate:modelValue"]("modified")

      expect(control.dirty).toBe(true)
    })

    it("should handle undefined values", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      control.field["onUpdate:modelValue"](undefined)

      expect(control.state).toBe(undefined)
      expect(control.field.modelValue).toBe(undefined)
    })
  })

  describe("When state is an object", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      expect(control.state).toEqual({ name: "John", age: 30 })
      expect(control.defaultState).toEqual({ name: "John", age: 30 })
      expect(control.dirty).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state = { name: "Jane", age: 25 }
      expect(control.state).toEqual({ name: "Jane", age: 25 })
      expect(control.dirty).toBe(true)
    })

    it("should handle state overrides with partial objects, deleting all properties not passed in the new state", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state = { name: "Jane" }
      expect(control.state).toEqual({ name: "Jane" })
      expect(control.dirty).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.state = { name: "Jane", age: 25 }
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual({ name: "John", age: 30 })
      expect(control.dirty).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      control.clear()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext({ name: "John", age: 30 })
      const control = createInputControl(context)

      const newDefault = { name: "Bob", age: 40 }
      control.updateDefaultState(newDefault)
      expect(control.defaultState).toEqual(newDefault)
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual(newDefault)
      expect(control.dirty).toBe(false)
    })

    it("should handle nested objects", () => {
      const context = useFormContext({
        user: { profile: { name: "John" } }
      })

      const control = createInputControl(context, ["user", "profile", "name"])

      expect(control.state).toBe("John")
      expect(control.dirty).toBe(false)

      control.state = "Jane"
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe("John")
      expect(control.dirty).toBe(false)
    })

    it("should handle deeply nested object changes", () => {
      const context = useFormContext({
        level1: { level2: { value: 42 } }
      })

      const control = createInputControl(context)

      control.state = { level1: { level2: { value: 100 } } }
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual({ level1: { level2: { value: 42 } } })
      expect(control.dirty).toBe(false)
    })

    it("should handle arrays nested in object state", () => {
      const context = useFormContext({
        user: {
          name: "John",
          hobbies: ["reading", "swimming"]
        }
      })

      const control = createInputControl(context, ["user", "hobbies"])

      expect(control.state).toEqual(["reading", "swimming"])
      expect(control.dirty).toBe(false)

      control.state = ["reading", "cycling"]
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual(["reading", "swimming"])
      expect(control.dirty).toBe(false)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext({ name: "John", age: 30 })

      const control = createInputControl(context)

      expect(control.dirty).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState).toBe(undefined)
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(false)
    })

    describe("validation properties for object paths", () => {
      it("should report isValid based on nested field errors", async () => {
        const schema = yup.object({
          name: yup.string().required("Name is required"),
          age: yup.number().required().min(0)
        })
        const context = useFormContext(
          { name: "", age: 30 },
          { validationSchema: schema }
        )
        const nameControl = createInputControl(context, ["name"])
        const ageControl = createInputControl(context, ["age"])

        await context.validate()

        expect(nameControl.isValid).toBe(false)
        expect(nameControl.errorMessages).toEqual(["Name is required"])

        // Age field should be valid since it has no errors
        expect(ageControl.isValid).toBe(true)
        expect(ageControl.errorMessages).toEqual([])
      })

      it("should handle deeply nested field validation", async () => {
        const schema = yup.object({
          user: yup.object({
            profile: yup.object({
              name: yup.string().required(),
              contact: yup.object({
                email: yup.string().email("Invalid email format").required()
              })
            })
          })
        })
        const context = useFormContext(
          {
            user: {
              profile: {
                name: "John",
                contact: { email: "not-an-email" }
              }
            }
          },
          { validationSchema: schema }
        )

        await context.validate()

        const emailControl = createInputControl(context, [
          "user",
          "profile",
          "contact",
          "email"
        ])

        expect(emailControl.isValid).toBe(false)
        expect(emailControl.errorMessages).toEqual(["Invalid email format"])

        // Name field should be valid
        const nameControl = createInputControl(context, [
          "user",
          "profile",
          "name"
        ])
        expect(nameControl.isValid).toBe(true)
        expect(nameControl.errorMessages).toEqual([])
      })

      it("should react to changes in nested errors", async () => {
        const schema = yup.object({
          user: yup.object({
            name: yup.string().min(3, "Name must be longer").required()
          })
        })
        const context = useFormContext(
          { user: { name: "Jo" } },
          { validationSchema: schema }
        )
        const nameControl = createInputControl(context, ["user", "name"])

        expect(nameControl.isValid).toBe(true)
        expect(nameControl.errorMessages).toEqual([])

        // Validate — should fail
        await context.validate()

        expect(nameControl.isValid).toBe(false)
        expect(nameControl.errorMessages).toEqual(["Name must be longer"])

        // Fix value and validate again — errors should clear
        nameControl.state = "John"
        await context.validate()

        expect(nameControl.isValid).toBe(true)
        expect(nameControl.errorMessages).toEqual([])
      })
    })

    describe("touched state for object paths", () => {
      it("should initially be untouched for nested paths", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const nameControl = createInputControl(context, ["name"])
        const ageControl = createInputControl(context, ["age"])

        expect(nameControl.touched).toBe(false)
        expect(ageControl.touched).toBe(false)
      })

      it("should touch only the specific nested field", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const nameControl = createInputControl(context, ["name"])
        const ageControl = createInputControl(context, ["age"])

        nameControl.setAsTouched()

        expect(nameControl.touched).toBe(true)
        expect(ageControl.touched).toBe(false)
      })

      it("should handle deeply nested paths independently", () => {
        const context = useFormContext({
          user: {
            profile: { name: "John" },
            settings: { theme: "dark" }
          }
        })
        const nameControl = createInputControl(context, [
          "user",
          "profile",
          "name"
        ])
        const themeControl = createInputControl(context, [
          "user",
          "settings",
          "theme"
        ])

        nameControl.setAsTouched()

        expect(nameControl.touched).toBe(true)
        expect(themeControl.touched).toBe(false)

        themeControl.setAsTouched()

        expect(nameControl.touched).toBe(true)
        expect(themeControl.touched).toBe(true)
      })

      it("should remain touched after state changes on nested path", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const nameControl = createInputControl(context, ["name"])

        nameControl.setAsTouched()
        nameControl.state = "Jane"

        expect(nameControl.touched).toBe(true)
      })

      it("should remain touched after reset on nested path", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const nameControl = createInputControl(context, ["name"])

        nameControl.setAsTouched()
        nameControl.state = "Jane"
        nameControl.reset()

        expect(nameControl.touched).toBe(true)
        expect(nameControl.state).toBe("John")
      })
    })
  })

  describe("When state is an array", () => {
    it("should expose the correct initial state and defaultValue", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      expect(control.state).toEqual([1, 2, 3])
      expect(control.defaultState).toEqual([1, 2, 3])
      expect(control.dirty).toBe(false)
    })

    it("should handle state changes and dirty detection", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.state = [1, 2, 4]
      expect(control.state).toEqual([1, 2, 4])
      expect(control.dirty).toBe(true)
    })

    it("should reset to default value and clear dirty state", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.state = [1, 2, 4]
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual([1, 2, 3])
      expect(control.dirty).toBe(false)
    })

    it("should clear the value and set dirty to true", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      control.clear()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(true)
    })

    it("should update the default value", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      const newDefault = [4, 5, 6]
      control.updateDefaultState(newDefault)
      expect(control.defaultState).toEqual(newDefault)
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual(newDefault)
      expect(control.dirty).toBe(false)
    })

    it("should handle array element access", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context, [0])

      expect(control.state).toBe(1)
      expect(control.defaultState).toBe(1)
      expect(control.dirty).toBe(false)

      control.state = 5
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(1)
      expect(control.dirty).toBe(false)

      control.clear()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(true)
    })

    it("should handle nested arrays", () => {
      const context = useFormContext([
        [1, 2],
        [3, 4]
      ])

      const control = createInputControl(context)

      expect(control.state).toEqual([
        [1, 2],
        [3, 4]
      ])
      expect(control.dirty).toBe(false)

      control.state = [
        [1, 2],
        [3, 5]
      ]
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual([
        [1, 2],
        [3, 4]
      ])
      expect(control.dirty).toBe(false)
    })

    it("should handle nested array element access", () => {
      const context = useFormContext([
        [1, 2],
        [3, 4]
      ])

      const control = createInputControl(context, [1, 0])

      expect(control.state).toBe(3)
      expect(control.defaultState).toBe(3)
      expect(control.dirty).toBe(false)

      control.state = 7
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(3)
      expect(control.dirty).toBe(false)
    })

    it("should handle array of objects", () => {
      const context = useFormContext([{ a: 1 }, { a: 2 }])
      const control = createInputControl(context)

      expect(control.state).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty).toBe(false)

      control.state = [{ a: 1 }, { a: 3 }]
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toEqual([{ a: 1 }, { a: 2 }])
      expect(control.dirty).toBe(false)
    })

    it("should handle object property within array", () => {
      const context = useFormContext([{ a: 1 }, { a: 2 }])
      const control = createInputControl(context, [1, "a"])

      expect(control.state).toBe(2)
      expect(control.defaultState).toBe(2)
      expect(control.dirty).toBe(false)

      control.state = 5
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(2)
      expect(control.dirty).toBe(false)
    })

    it("should handle setting default state to undefined", () => {
      const context = useFormContext([1, 2, 3])
      const control = createInputControl(context)

      expect(control.dirty).toBe(false)

      control.updateDefaultState(undefined)
      expect(control.defaultState).toBe(undefined)
      expect(control.dirty).toBe(true)

      control.reset()
      expect(control.state).toBe(undefined)
      expect(control.dirty).toBe(false)
    })

    describe("validation properties for array paths", () => {
      it("should report isValid based on array item errors", async () => {
        const schema = yup
          .array()
          .of(yup.string().min(5, "Item must be at least 5 characters"))
        const context = useFormContext(["apple", "no", "cherry"], {
          validationSchema: schema
        })

        await context.validate()

        // First item should be valid
        const firstItemControl = createInputControl(context, [0])
        expect(firstItemControl.isValid).toBe(true)
        expect(firstItemControl.errorMessages).toEqual([])

        // Second item should be invalid
        const secondItemControl = createInputControl(context, [1])
        expect(secondItemControl.isValid).toBe(false)
        expect(secondItemControl.errorMessages).toEqual([
          "Item must be at least 5 characters"
        ])
      })

      it("should handle validation for nested objects in arrays", async () => {
        const schema = yup.array().of(
          yup.object({
            name: yup.string().required("Name is required"),
            age: yup
              .number()
              .required()
              .min(0, "Age must be positive")
          })
        )
        const context = useFormContext(
          [
            { name: "", age: 30 },
            { name: "Jane", age: -5 }
          ],
          { validationSchema: schema }
        )

        await context.validate()

        // First item's name should be invalid
        const firstNameControl = createInputControl(context, [0, "name"])
        expect(firstNameControl.isValid).toBe(false)
        expect(firstNameControl.errorMessages).toEqual(["Name is required"])

        // First item's age should be valid
        const firstAgeControl = createInputControl(context, [0, "age"])
        expect(firstAgeControl.isValid).toBe(true)
        expect(firstAgeControl.errorMessages).toEqual([])

        // Second item's age should be invalid
        const secondAgeControl = createInputControl(context, [1, "age"])
        expect(secondAgeControl.isValid).toBe(false)
        expect(secondAgeControl.errorMessages).toEqual([
          "Age must be positive"
        ])
      })

      it("should react to changes in array item errors", async () => {
        const schema = yup
          .array()
          .of(yup.string().min(3, "Item too short"))
        const context = useFormContext(["aaa", "bb", "ccc"], {
          validationSchema: schema
        })
        const middleItemControl = createInputControl(context, [1])

        expect(middleItemControl.isValid).toBe(true)
        expect(middleItemControl.errorMessages).toEqual([])

        // Validate — middle item should fail
        await context.validate()

        expect(middleItemControl.isValid).toBe(false)
        expect(middleItemControl.errorMessages).toEqual(["Item too short"])

        // Fix value and validate again — errors should clear
        middleItemControl.state = "bbb"
        await context.validate()

        expect(middleItemControl.isValid).toBe(true)
        expect(middleItemControl.errorMessages).toEqual([])
      })

      it("should handle multiple errors on the same array item", async () => {
        const schema = yup.array().of(
          yup.object({
            name: yup
              .string()
              .required("Name is required")
              .min(2, "Name must be at least 2 characters")
          })
        )
        const context = useFormContext([{ name: "" }], {
          validationSchema: schema
        })

        await context.validate()

        const nameControl = createInputControl(context, [0, "name"])
        expect(nameControl.isValid).toBe(false)
        expect(nameControl.errorMessages).toEqual([
          "Name is required",
          "Name must be at least 2 characters"
        ])
      })
    })

    describe("touched state for array paths", () => {
      it("should initially be untouched for array elements", () => {
        const context = useFormContext([1, 2, 3])
        const firstControl = createInputControl(context, [0])
        const secondControl = createInputControl(context, [1])

        expect(firstControl.touched).toBe(false)
        expect(secondControl.touched).toBe(false)
      })

      it("should touch only the specific array element", () => {
        const context = useFormContext([1, 2, 3])
        const firstControl = createInputControl(context, [0])
        const secondControl = createInputControl(context, [1])

        firstControl.setAsTouched()

        expect(firstControl.touched).toBe(true)
        expect(secondControl.touched).toBe(false)
      })

      it("should handle touched state for objects within arrays", () => {
        const context = useFormContext([
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ])
        const firstNameControl = createInputControl(context, [0, "name"])
        const secondNameControl = createInputControl(context, [1, "name"])
        const firstAgeControl = createInputControl(context, [0, "age"])

        firstNameControl.setAsTouched()

        expect(firstNameControl.touched).toBe(true)
        expect(secondNameControl.touched).toBe(false)
        expect(firstAgeControl.touched).toBe(false)
      })

      it("should remain touched after state changes on array element", () => {
        const context = useFormContext([1, 2, 3])
        const firstControl = createInputControl(context, [0])

        firstControl.setAsTouched()
        firstControl.state = 10

        expect(firstControl.touched).toBe(true)
      })

      it("should remain touched after reset on array element", () => {
        const context = useFormContext([1, 2, 3])
        const firstControl = createInputControl(context, [0])

        firstControl.setAsTouched()
        firstControl.state = 10
        firstControl.reset()

        expect(firstControl.touched).toBe(true)
        expect(firstControl.state).toBe(1)
      })
    })
  })
})
