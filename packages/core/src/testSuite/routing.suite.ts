import { describe, it, expect } from "vitest"
import { createUseForm } from "../useForm"
import type {
  Cell,
  ReactivityAdapter,
  Updater
} from "../types/adapter"

type Call =
  | {
      kind: "setIn"
      cell: Cell<unknown>
      path: ReadonlyArray<string | number | symbol>
      value: unknown
    }
  | { kind: "update"; cell: Cell<unknown> }

const wrapWithSpy = (adapter: ReactivityAdapter) => {
  const calls: Call[] = []
  const spy: ReactivityAdapter = {
    cell: adapter.cell,
    get: adapter.get,
    update: (cell, updater) => {
      calls.push({ kind: "update", cell: cell as Cell<unknown> })
      adapter.update(cell, updater as Updater<unknown>)
    },
    setIn: (cell, path, value) => {
      calls.push({
        kind: "setIn",
        cell: cell as Cell<unknown>,
        path: path as ReadonlyArray<string | number | symbol>,
        value
      })
      adapter.setIn(cell, path, value)
    }
  }
  return { adapter: spy, calls }
}

export const runRoutingTests = (baseAdapter: ReactivityAdapter) => {
  describe("core routing of state mutations", () => {
    it("uses setIn for path-keyed state mutations", () => {
      const { adapter, calls } = wrapWithSpy(baseAdapter)
      const useForm = createUseForm(adapter)
      const { form } = useForm({ a: { b: 1 } })

      const baseline = calls.length
      form.a.b.$control.state = 2
      const after = calls.slice(baseline)

      const setIns = after.filter((c) => c.kind === "setIn") as Extract<
        Call,
        { kind: "setIn" }
      >[]
      expect(setIns).toHaveLength(1)
      expect(setIns[0]!.path).toEqual(["a", "b"])
      expect(setIns[0]!.value).toBe(2)

      const stateCell = setIns[0]!.cell
      expect(
        after.some((c) => c.kind === "update" && c.cell === stateCell)
      ).toBe(false)

      expect(form.a.b.$control.state).toBe(2)
    })

    it("uses update (not setIn) for whole-form replacement", () => {
      const { adapter, calls } = wrapWithSpy(baseAdapter)
      const useForm = createUseForm(adapter)
      const { form } = useForm({ a: 1 })

      form.a.$control.state = 2
      const setInSeed = calls.find((c) => c.kind === "setIn") as Extract<
        Call,
        { kind: "setIn" }
      >
      const stateCell = setInSeed.cell

      const baseline = calls.length
      form.$control.state = { a: 99 }
      const after = calls.slice(baseline)

      expect(
        after.some((c) => c.kind === "setIn" && c.cell === stateCell)
      ).toBe(false)
      expect(
        after.some((c) => c.kind === "update" && c.cell === stateCell)
      ).toBe(true)
      expect(form.a.$control.state).toBe(99)
    })

    it("uses setIn for nested array element mutations", () => {
      const { adapter, calls } = wrapWithSpy(baseAdapter)
      const useForm = createUseForm(adapter)
      const { form } = useForm({ tags: ["a", "b"] })

      const baseline = calls.length
      form.tags[1]!.$control.state = "B"

      const setIns = calls
        .slice(baseline)
        .filter((c) => c.kind === "setIn") as Extract<
        Call,
        { kind: "setIn" }
      >[]
      expect(setIns).toHaveLength(1)
      // Proxy property keys come through as strings, even for array indices.
      expect(setIns[0]!.path).toEqual(["tags", "1"])
      expect(form.tags[1]!.$control.state).toBe("B")
    })
  })
}
