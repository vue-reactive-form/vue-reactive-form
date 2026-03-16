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

      it("should report isValid as false when there are errors", () => {
        const context = useFormContext("invalid value")
        const { errors } = context
        errors.value = {
          "": [
            { message: "Value is required", path: [] },
            {
              message: "Value must be at least 3 characters",

              path: []
            }
          ]
        }
        const control = createInputControl(context)

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual([
          "Value is required",
          "Value must be at least 3 characters"
        ])
      })

      it("should react to changes in the errors state", () => {
        const context = useFormContext("some value")
        const { errors } = context
        const control = createInputControl(context)

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])

        // Add errors - for root level control, errors are stored with empty string key
        errors.value = {
          "": [{ message: "This field is invalid", path: [] }]
        }

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual(["This field is invalid"])

        // Clear errors
        errors.value = {}

        expect(control.isValid).toBe(true)
        expect(control.errorMessages).toEqual([])
      })

      it("should clear error messages when updating the state", () => {
        const context = useFormContext("some value")
        const { setFieldErrors } = context
        const control = createInputControl(context)

        setFieldErrors([], [{ message: "Some error", path: [] }])

        expect(control.isValid).toBe(false)
        expect(control.errorMessages).toEqual(["Some error"])

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

      it("should handle empty error arrays", () => {
        const context = useFormContext("some value")
        const { errors } = context
        errors.value = { "": [] }
        const control = createInputControl(context)

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
    it("should trigger validation when fieldProps.onBlur is called", async () => {
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
      control.fieldProps.onFocus()
      control.fieldProps.onBlur()

      // Wait for async validation
      await new Promise((r) => setTimeout(r, 0))

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

      control.fieldProps.onBlur()

      await new Promise((r) => setTimeout(r, 0))

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
      nameControl.fieldProps.onFocus()
      nameControl.fieldProps.onBlur()
      await new Promise((r) => setTimeout(r, 0))

      // Name errors are written
      expect(nameControl.isValid).toBe(false)
      expect(nameControl.errorMessages).toEqual(["Name required"])

      // Age errors are NOT written — it was never blurred
      expect(ageControl.isValid).toBe(true)
      expect(ageControl.errorMessages).toEqual([])
    })

    it("should set touched on focus via fieldProps", () => {
      const context = useFormContext({ name: "John" })
      const control = createInputControl(context, ["name"])

      expect(control.touched).toBe(false)

      control.fieldProps.onFocus()

      expect(control.touched).toBe(true)
    })
  })

  describe("fieldProps model binding", () => {
    it("should expose current state as modelValue", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      expect(control.fieldProps.modelValue).toBe("hello")
    })

    it("should update state via onUpdate:modelValue", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      control.fieldProps["onUpdate:modelValue"]("world")

      expect(control.state).toBe("world")
      expect(control.fieldProps.modelValue).toBe("world")
    })

    it("should reflect external state changes in modelValue", () => {
      const context = useFormContext("initial")
      const control = createInputControl(context)

      control.state = "changed"

      expect(control.fieldProps.modelValue).toBe("changed")
    })

    it("should work with nested object paths", () => {
      const context = useFormContext({ user: { name: "John" } })
      const control = createInputControl(context, ["user", "name"])

      expect(control.fieldProps.modelValue).toBe("John")

      control.fieldProps["onUpdate:modelValue"]("Jane")

      expect(control.state).toBe("Jane")
      expect(control.fieldProps.modelValue).toBe("Jane")
    })

    it("should mark field as dirty when updated via onUpdate:modelValue", () => {
      const context = useFormContext("original")
      const control = createInputControl(context)

      expect(control.dirty).toBe(false)

      control.fieldProps["onUpdate:modelValue"]("modified")

      expect(control.dirty).toBe(true)
    })

    it("should handle undefined values", () => {
      const context = useFormContext("hello")
      const control = createInputControl(context)

      control.fieldProps["onUpdate:modelValue"](undefined)

      expect(control.state).toBe(undefined)
      expect(control.fieldProps.modelValue).toBe(undefined)
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
      it("should report isValid based on nested field errors", () => {
        const context = useFormContext({ name: "John", age: 30 })
        const { errors } = context
        errors.value = {
          name: [{ message: "Name is required", path: ["name"] }]
        }
        const nameControl = createInputControl(context, ["name"])

        expect(nameControl.isValid).toBe(false)
        expect(nameControl.errorMessages).toEqual(["Name is required"])

        // Age field should be valid since it has no errors
        const ageControl = createInputControl(context, ["age"])
        expect(ageControl.isValid).toBe(true)
        expect(ageControl.errorMessages).toEqual([])
      })

      it("should handle deeply nested field validation", () => {
        const context = useFormContext({
          user: {
            profile: {
              name: "John",
              contact: { email: "john@example.com" }
            }
          }
        })
        const { errors } = context
        errors.value = {
          "user.profile.contact.email": [
            {
              message: "Invalid email format",

              path: ["user", "profile", "contact", "email"]
            }
          ]
        }

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

      it("should react to changes in nested errors", () => {
        const context = useFormContext({ user: { name: "John" } })
        const { errors } = context
        const nameControl = createInputControl(context, ["user", "name"])
        expect(nameControl.isValid).toBe(true)
        expect(nameControl.errorMessages).toEqual([])

        // Add error for nested field
        errors.value = {
          "user.name": [
            {
              message: "Name must be longer",

              path: ["user", "name"]
            }
          ]
        }

        expect(nameControl.isValid).toBe(false)
        expect(nameControl.errorMessages).toEqual(["Name must be longer"])

        // Clear errors
        errors.value = {}

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
      it("should report isValid based on array item errors", () => {
        const context = useFormContext(["apple", "banana", "cherry"])
        const { errors } = context
        errors.value = {
          "1": [{ message: "Item at index 1 is invalid", path: [1] }]
        }

        // First item should be valid
        const firstItemControl = createInputControl(context, [0])
        expect(firstItemControl.isValid).toBe(true)
        expect(firstItemControl.errorMessages).toEqual([])

        // Second item should be invalid
        const secondItemControl = createInputControl(context, [1])
        expect(secondItemControl.isValid).toBe(false)
        expect(secondItemControl.errorMessages).toEqual([
          "Item at index 1 is invalid"
        ])
      })

      it("should handle validation for nested objects in arrays", () => {
        const context = useFormContext([
          { name: "John", age: 30 },
          { name: "Jane", age: 25 }
        ])
        const { errors } = context
        errors.value = {
          "0.name": [
            {
              message: "Name at index 0 is required",

              path: [0, "name"]
            }
          ],
          "1.age": [
            {
              message: "Age at index 1 must be positive",

              path: [1, "age"]
            }
          ]
        }

        // First item's name should be invalid
        const firstNameControl = createInputControl(context, [0, "name"])
        expect(firstNameControl.isValid).toBe(false)
        expect(firstNameControl.errorMessages).toEqual([
          "Name at index 0 is required"
        ])

        // First item's age should be valid
        const firstAgeControl = createInputControl(context, [0, "age"])
        expect(firstAgeControl.isValid).toBe(true)
        expect(firstAgeControl.errorMessages).toEqual([])

        // Second item's age should be invalid
        const secondAgeControl = createInputControl(context, [1, "age"])
        expect(secondAgeControl.isValid).toBe(false)
        expect(secondAgeControl.errorMessages).toEqual([
          "Age at index 1 must be positive"
        ])
      })

      it("should react to changes in array item errors", () => {
        const context = useFormContext(["item1", "item2", "item3"])
        const { errors } = context
        const middleItemControl = createInputControl(context, [1])

        expect(middleItemControl.isValid).toBe(true)
        expect(middleItemControl.errorMessages).toEqual([])

        // Add error for middle item
        errors.value = {
          "1": [{ message: "Middle item is invalid", path: [1] }]
        }

        expect(middleItemControl.isValid).toBe(false)
        expect(middleItemControl.errorMessages).toEqual([
          "Middle item is invalid"
        ])

        // Clear errors
        errors.value = {}

        expect(middleItemControl.isValid).toBe(true)
        expect(middleItemControl.errorMessages).toEqual([])
      })

      it("should handle multiple errors on the same array item", () => {
        const context = useFormContext([{ name: "", age: -5 }])
        const { errors } = context
        errors.value = {
          "0.name": [
            {
              message: "Name is required",

              path: [0, "name"]
            },
            {
              message: "Name must be at least 2 characters",

              path: [0, "name"]
            }
          ]
        }

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
