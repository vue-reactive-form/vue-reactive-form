import type { ArrayInputControl, InputControl } from "./controls"
import type { IsArray, IsPlainObject } from "./utils"

export type PrimitiveFormNode<T> = {
  $control: InputControl<T>
}

export type ObjectFormNode<T extends object> = PrimitiveFormNode<T> & {
  [Key in keyof T]: FormNode<T[Key]>
}

/**
 * Form node representing an array.
 * Allows the necessary features for type driven navigation through its children.
 */
export type ArrayFormNode<T extends unknown[]> = {
  [index: number]: FormNode<T[number]>
  [Symbol.iterator](): IterableIterator<FormNode<T[number]>>
  $control: ArrayInputControl<T>
}

/**
 * Represents a node inside a form tree and allows navigation through its children when present,
 * allowing access to the {@link InputControl} of such nodes.
 */
export type FormNode<T> = IsPlainObject<T> extends true
  ? ObjectFormNode<T & object>
  : IsArray<T> extends true
  ? ArrayFormNode<T & unknown[]>
  : PrimitiveFormNode<T>
