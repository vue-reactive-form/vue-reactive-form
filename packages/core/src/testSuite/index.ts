import type { ReactivityAdapter } from "../types/adapter"
import { runUseFormTests } from "./useForm.suite"
import { runInputControlTests } from "./inputControl.suite"
import { runArrayInputControlTests } from "./arrayInputControl.suite"
import { runControlExtensionTests } from "./controlExtension.suite"
import { runRoutingTests } from "./routing.suite"

/**
 * Run the framework-agnostic `useForm` contract suite against a concrete
 * `ReactivityAdapter`. Every adapter package should expose a single test
 * file that calls this — it verifies the adapter satisfies the same
 * behavioural contract that core relies on.
 *
 * The suite registers `describe`/`it` blocks against the vitest runner of
 * the calling package, so it must be invoked from within a `*.test.ts` file
 * picked up by that runner.
 */
export const runUseFormSuite = (adapter: ReactivityAdapter) => {
  runUseFormTests(adapter)
  runInputControlTests(adapter)
  runArrayInputControlTests(adapter)
  runControlExtensionTests(adapter)
  runRoutingTests(adapter)
}

export { runUseFormTests } from "./useForm.suite"
export { runInputControlTests } from "./inputControl.suite"
export { runArrayInputControlTests } from "./arrayInputControl.suite"
export { runControlExtensionTests } from "./controlExtension.suite"
export { runRoutingTests } from "./routing.suite"
