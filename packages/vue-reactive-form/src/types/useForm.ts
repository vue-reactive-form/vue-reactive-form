import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FormNode } from "./formNodes"
import type { InputControl } from "./controls"
import type { ValidationIssue } from "../validation"
import type { Ref, MaybeRef } from "@vue/reactivity"
import type { RequiredOrPrimitive } from "./utils"
import type { PropertyPath } from "lodash-es"

export type ControlsCache = Map<string, InputControl<unknown>>
/**
 * Container for all form-wide validation errors.
 * The errors are stored with paths in dot notation as keys, and the list of issues for the property at such a path as the value.
 */
export type FormErrors = Record<string, ValidationIssue[]>

/**
 * Internal context shared across the form's control tree.
 * Contains all the core reactive state needed by form controls.
 */
export type FormContext<TState, TValidatedState = TState> = {
  /** The current form state */
  state: Ref<TState>
  /** The default/initial form state, used for dirty checking and reset */
  defaultFormState: Ref<TState | undefined>
  /** Form-wide validation errors keyed by path */
  errors: Ref<FormErrors>
  /** Cache of input controls to avoid re-creating them */
  controlsCache: ControlsCache
  /**
   * Sets the state of a specific field in the form.
   *
   * @param path The path to the field.
   * @param value The new value for the field.
   * @param stateType The type of state to set. "default" for the default state, "current" for the current state.
   */
  setFieldState: (
    path: PropertyPath,
    value: unknown,
    stateType: "default" | "current"
  ) => void
  /**
   * Gets the state of a specific field in the form.
   *
   * @param path The path to the field.
   * @param stateType The type of state to get. "default" for the default state, "current" for the current state.
   * @returns The value of the field.
   */
  getFieldState: (path: PropertyPath, stateType: "default" | "current") => any
  /**
   * Gets the validation errors for a specific field in the form.
   *
   * @param path The path to the field.
   * @returns The list of validation issues for the field.
   */
  getFieldErrors: (path: PropertyPath) => ValidationIssue[]
  /**
   * Sets the validation errors for a specific field in the form.
   *
   * @param path The path to the field.
   * @param errors The list of validation issues for the field.
   */
  setFieldErrors: (path: PropertyPath, errors: ValidationIssue[]) => void
  /**
   * Sets a specific field as touched.
   *
   * @param path The path to the field.
   */
  setFieldAsTouched: (path: PropertyPath) => void
  /**
   * Checks if a specific field has been touched.
   *
   * @param path The path to the field.
   * @returns True if the field has been touched, false otherwise.
   */
  isFieldTouched: (path: PropertyPath) => boolean
  /**
   * Sets all fields that have been accessed (cached) as touched.
   */
  setAllFieldsAsTouched: () => void
  /**
   * Handler to imperatively invoke the form's validation.
   * When successful returns the validated state, otherwise it returns undefined.
   */
  validate: () => Promise<TValidatedState | undefined>
}

export type ValidateOn = "submit" | "change"

export type UseFormContextOptions<TState, TValidatedState = TState> = {
  validationSchema?: MaybeRef<
    StandardSchemaV1<TState, TValidatedState> | undefined
  >
}

export type UseFormOptions<TState, TValidatedState = TState> =
  UseFormContextOptions<TState, TValidatedState>

export type HandleSubmitOptions<TValidatedState> = {
  /**
   * Called when the form is successfully submitted. Prevents default behavior of the form submission event.
   *
   * @param state The validated form state.
   */
  onSuccess?: (state: TValidatedState) => void
  /**
   * Called when the form submission fails due to validation errors.
   *
   * @param errors The form errors.
   */
  onError?: (errors: FormErrors) => void
}

export type HandleFormSubmit<TValidatedState> = (
  opts?: HandleSubmitOptions<TValidatedState>
) => (e?: Event) => Promise<void>

export type FormRoot<TState, TValidatedState = TState> = {
  /**
   * Entry point to the form tree.
   * Allows to navigate the state of the form to have access to the form-related metadata for each node.
   * The form state is passed as a deeply required object to ensure that navigation is possible up to every node.
   */
  form: FormNode<RequiredOrPrimitive<TState>>
  /**
   * Object containing all of the validation errors for the form after some validation occurred.
   */
  errors: Ref<FormErrors>
  /**
   * Handler to imperatively invoke the form's validation.
   * When successful returns the validates tate, otherwise it returns undefined.
   */
  validate: () => Promise<TValidatedState | undefined>
  /**
   * Function to create the formSubmit handler that can be bound or called when the submit takes place.
   * onSuccess and onError callbacks can be provided as needed to handle follow-ups based on the outcome.
   */
  handleSubmit: HandleFormSubmit<TValidatedState>
}
