import type { Object } from "ts-toolbelt"

export interface NotPlainTypes {
  types: Function | readonly any[] | Date | RegExp | Error | Promise<any>
}

type NotPlain = NotPlainTypes["types"]

export type IsPlainObject<T> = T extends object
  ? T extends NotPlain
    ? false
    : true
  : false

export type IsArray<T> = T extends unknown[] ? true : false

export type PartialOrPrimitive<T> = T extends object
  ? Object.Partial<T, "deep">
  : T

export type RequiredOrPrimitive<T> = T extends object
  ? Object.Required<T, keyof T, "deep">
  : T
