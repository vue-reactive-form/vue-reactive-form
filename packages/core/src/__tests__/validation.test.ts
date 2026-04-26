import { describe, it, expect } from "vitest"
import * as yup from "yup"
import { standardValidate } from "../validation"

describe("standardValidate", () => {
  describe("Successful validation", () => {
    it("should validate a simple string schema", async () => {
      const schema = yup.string().required()
      const input = "hello world"

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toBe("hello world")
      }
    })

    it("should validate a number schema with transformation", async () => {
      const schema = yup.number().required().min(0)
      const input = 42

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toBe(42)
      }
    })

    it("should validate a complex object schema", async () => {
      const schema = yup.object({
        name: yup.string().required(),
        age: yup.number().required().min(0),
        email: yup.string().email().required(),
        isActive: yup.boolean().default(true)
      })

      const input = {
        name: "John Doe",
        age: 30,
        email: "john@example.com"
      } as any // Using 'as any' to work around strict typing for optional fields

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toEqual({
          name: "John Doe",
          age: 30,
          email: "john@example.com",
          isActive: true
        })
      }
    })

    it("should validate an array schema", async () => {
      const schema = yup.array().of(yup.string().required()).min(1)
      const input = ["apple", "banana", "cherry"]

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toEqual(["apple", "banana", "cherry"])
      }
    })

    it("should validate nested object schemas", async () => {
      const schema = yup.object({
        user: yup.object({
          profile: yup.object({
            name: yup.string().required(),
            preferences: yup.object({
              theme: yup.string().oneOf(["light", "dark"]).default("light")
            })
          })
        })
      })

      const input = {
        user: {
          profile: {
            name: "Jane Doe",
            preferences: {}
          }
        }
      } as any // Using 'as any' to work around strict typing for optional fields

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.user.profile.preferences.theme).toBe("light")
      }
    })
  })

  describe("Failed validation", () => {
    it("should fail validation for required field", async () => {
      const schema = yup.string().required("Name is required")
      const input = undefined as any

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.issues).toHaveLength(1)
        expect(result.issues[0]?.message).toBe("Name is required")
        expect(result.issues[0]?.path).toEqual([])
      }
    })

    it("should fail validation for invalid email", async () => {
      const schema = yup.string().email("Invalid email format")
      const input = "not-an-email"

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.issues).toHaveLength(1)
        expect(result.issues[0]?.message).toBe("Invalid email format")
        expect(result.issues[0]?.path).toEqual([])
      }
    })

    it("should fail validation for object with multiple errors", async () => {
      const schema = yup.object({
        name: yup.string().required("Name is required"),
        age: yup
          .number()
          .required("Age is required")
          .min(0, "Age must be positive"),
        email: yup.string().email("Invalid email").required("Email is required")
      })

      const input = {
        name: "",
        age: -5,
        email: "invalid-email"
      }

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.issues.length).toEqual(3)

        const nameIssue = result.issues.find((issue) =>
          issue.path.includes("name")
        )
        expect(nameIssue?.message).toBe("Name is required")

        const ageIssue = result.issues.find((issue) =>
          issue.path.includes("age")
        )
        expect(ageIssue?.message).toBe("Age must be positive")

        const emailIssue = result.issues.find((issue) =>
          issue.path.includes("email")
        )
        expect(emailIssue?.message).toBe("Invalid email")
      }
    })

    it("should handle nested object validation errors with correct paths", async () => {
      const schema = yup.object({
        user: yup.object({
          profile: yup.object({
            name: yup.string().required("Name is required"),
            contact: yup.object({
              email: yup
                .string()
                .email("Invalid email")
                .required("Email is required")
            })
          })
        })
      })

      const input = {
        user: {
          profile: {
            name: "",
            contact: {
              email: "not-valid-email"
            }
          }
        }
      }

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        const nameIssue = result.issues.find(
          (issue) => issue.path.join(".") === "user.profile.name"
        )
        expect(nameIssue?.message).toBe("Name is required")

        const emailIssue = result.issues.find(
          (issue) => issue.path.join(".") === "user.profile.contact.email"
        )
        expect(emailIssue?.message).toBe("Invalid email")
      }
    })

    it("should handle array validation errors with indexed paths", async () => {
      const schema = yup.array().of(
        yup.object({
          name: yup.string().required("Name is required"),
          age: yup
            .number()
            .required("Age is required")
            .min(0, "Age must be positive")
        })
      )

      const input = [
        { name: "John", age: 25 },
        { name: "", age: -5 }
      ]

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        const nameIssue = result.issues.find(
          (issue) => issue.path.join(".") === "1.name"
        )
        expect(nameIssue?.message).toBe("Name is required")

        const ageIssue = result.issues.find(
          (issue) => issue.path.join(".") === "1.age"
        )
        expect(ageIssue?.message).toBe("Age must be positive")
      }
    })

    it("should handle mixed array and object validation errors", async () => {
      const schema = yup.object({
        users: yup.array().of(
          yup.object({
            profile: yup.object({
              name: yup.string().required("Name is required"),
              tags: yup.array().of(yup.string().required("Tag cannot be empty"))
            })
          })
        )
      })

      const input = {
        users: [
          {
            profile: {
              name: "John",
              tags: ["admin", "", "user"]
            }
          },
          {
            profile: {
              name: "",
              tags: ["guest"]
            }
          }
        ]
      }

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        // Check for empty tag error at users[0].profile.tags[1]
        const tagIssue = result.issues.find(
          (issue) => issue.path.join(".") === "users.0.profile.tags.1"
        )
        expect(tagIssue?.message).toBe("Tag cannot be empty")

        // Check for empty name error at users[1].profile.name
        const nameIssue = result.issues.find(
          (issue) => issue.path.join(".") === "users.1.profile.name"
        )
        expect(nameIssue?.message).toBe("Name is required")
      }
    })
  })

  describe("Edge cases", () => {
    it("should handle null input gracefully", async () => {
      const schema = yup.string().nullable()
      const input = null

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toBe(null)
      }
    })

    it("should handle undefined input gracefully", async () => {
      const schema = yup.string().optional()
      const input = undefined

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toBe(undefined)
      }
    })

    it("should handle empty object validation", async () => {
      const schema = yup.object({})
      const input = {}

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toEqual({})
      }
    })

    it("should handle empty array validation", async () => {
      const schema = yup.array().of(yup.string())
      const input: string[] = []

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toEqual([])
      }
    })

    it("should normalize path segments correctly", async () => {
      const schema = yup.object({
        "complex-key": yup.object({
          "nested-key": yup.string().required("Required field")
        })
      })

      const input = {
        "complex-key": {
          "nested-key": ""
        }
      }

      const result = await standardValidate(schema, input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.issues[0]?.path).toEqual(["complex-key", "nested-key"])
      }
    })
  })
})
