# vue-reactive-form

Lightweight, type-safe form state management and validation for Vue 3. Leverages Vue's reactivity system to provide a seamless, flexible way to manage form state and validation - without depending on strings to link inputs to the form.

🚀 **Get started in minutes** - no boilerplate, no learning curve. Just reactive forms that work.

Check out the [live demo](https://vue-reactive-form.github.io/vue-reactive-form/) for a hands-on example.

**Killer Features**:

- **Lightweight** - Minimal footprint, focused on form state and validation without unnecessary bloat
- **Type-safe** - Built with TypeScript, ensuring your form values and validation rules are fully typed. Navigate nested form state with full autocompletion
- **Standard Schema validation** - Compatible with [Standard Schema](https://github.com/standard-schema/standard-schema), making it work out of the box with Yup, Zod, Valibot, and others
- **Headless & UI agnostic** - Core form logic and state management without enforcing any UI components or styles. Works with any UI library or custom design system
- **Reactive validation schema** - Pass a `ref` as your validation schema and swap validation rules dynamically at runtime
- **Proxy-based tree navigation** - Access any field's control at any depth via dot-path notation (`form.user.profile.name.$control`), no string paths needed

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Understanding the `$control` Pattern](#understanding-the-control-pattern)
- [Form State](#form-state)
  - [Primitive Root State](#primitive-root-state)
  - [Object State](#object-state)
  - [Nested Objects](#nested-objects)
  - [Arrays](#arrays)
  - [Iterating Over Arrays](#iterating-over-arrays)
- [Validation](#validation)
  - [Standard Schema Support](#standard-schema-support)
  - [Reactive Validation Schema](#reactive-validation-schema)
  - [Handling Validation Errors](#handling-validation-errors)
- [Submitting](#submitting)
- [API](#api)
  - [`useForm(defaultState, options?)`](#useformdefaultstate-options)
  - [`FormRoot`](#formroot)
    - [`FormRoot.form`](#formrootform)
    - [`FormRoot.errors`](#formrooterrors)
    - [`FormRoot.validate()`](#formrootvalidate)
    - [`FormRoot.handleSubmit(options?)`](#formroothandlesubmitoptions)
  - [`FormNode`](#formnode)
  - [`InputControl`](#inputcontrol)
    - [`InputControl.state`](#inputcontrolstate)
    - [`InputControl.defaultState`](#inputcontroldefaultstate)
    - [`InputControl.dirty`](#inputcontroldirty)
    - [`InputControl.touched`](#inputcontroltouched)
    - [`InputControl.isValid`](#inputcontrolisvalid)
    - [`InputControl.errorMessages`](#inputcontrolerrormessages)
    - [`InputControl.clear()`](#inputcontrolclear)
    - [`InputControl.reset()`](#inputcontrolreset)
    - [`InputControl.updateDefaultState(newDefault?)`](#inputcontrolupdatedefaultstatenewdefault)
    - [`InputControl.setAsTouched()`](#inputcontrolsetastouched)
  - [`ArrayInputControl`](#arrayinputcontrol)
    - [`ArrayInputControl.add(defaultValue?)`](#arrayinputcontroladddefaultvalue)
    - [`ArrayInputControl.remove(index)`](#arrayinputcontrolremoveindex)
    - [`ArrayInputControl.moveItem(fromIndex, toIndex)`](#arrayinputcontrolmoveitemfromindex-toindex)
- [TypeScript](#typescript)
  - [Typed Forms](#typed-forms)
  - [Separate Input and Output Types](#separate-input-and-output-types)
  - [Exported Types](#exported-types)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
npm install @vue-reactive-form/core
# or
pnpm add @vue-reactive-form/core
# or
yarn add @vue-reactive-form/core
```

**Peer dependency**: `@vue/reactivity ^3.4.0` (included with Vue 3).

## Getting Started

Define your initial state, bind to controls, and submit.

```vue
<script setup lang="ts">
import { useForm } from "@vue-reactive-form/core"

// 1. Define your form state
const { form, handleSubmit } = useForm({
  name: "",
  email: ""
})

// 2. Create a submit handler
const onSubmit = handleSubmit({
  onSuccess: (data) => {
    console.log("Form submitted:", data)
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Name</label>
      <!-- 3. Bind to form controls -->
      <input v-model="form.name.$control.state.value" type="text" />
    </div>

    <div>
      <label>Email</label>
      <input v-model="form.email.$control.state.value" type="email" />
    </div>

    <button type="submit">Submit</button>
  </form>
</template>
```

### Understanding the `$control` Pattern

Every node in the form tree exposes a `$control` object, which is an [`InputControl`](#inputcontrol) (or [`ArrayInputControl`](#arrayinputcontrol) for arrays). This is your gateway to the field's reactive state and metadata:

```ts
form.name.$control.state.value // Current value (read/write)
form.name.$control.defaultState.value // Default value (read-only)
form.name.$control.dirty.value // true if value differs from default
form.name.$control.touched.value // true after setAsTouched() is called
form.name.$control.isValid.value // true when no validation errors
form.name.$control.errorMessages.value // string[] of error messages
```

The `$control` is available at **every level** of the form tree - from the root, through nested objects, down to individual array elements.

## Form State

### Primitive Root State

The root state doesn't have to be an object. It can be a primitive value:

```ts
const { form } = useForm("Hello World")

form.$control.state.value // "Hello World"
```

### Object State

Object state lets you navigate to each property's control:

```ts
const { form } = useForm({ name: "John", age: 30 })

form.name.$control.state.value // "John"
form.age.$control.state.value // 30

// Update a field
form.name.$control.state.value = "Jane"
form.name.$control.dirty.value // true
```

### Nested Objects

Navigate arbitrarily deep nested structures seamlessly:

```ts
const { form } = useForm({
  user: {
    profile: {
      name: "John",
      email: "john@example.com"
    }
  }
})

form.user.profile.name.$control.state.value // "John"
form.user.profile.email.$control.state.value // "john@example.com"
```

Each intermediate node also has a `$control`:

```ts
// Access the entire profile object
form.user.profile.$control.state.value // { name: "John", email: "john@example.com" }

// Replace the entire profile at once
form.user.profile.$control.state.value = {
  name: "Jane",
  email: "jane@example.com"
}
```

### Arrays

Array fields support index-based access and have additional array-specific methods via [`ArrayInputControl`](#arrayinputcontrol):

```ts
const { form } = useForm({
  tags: ["javascript", "vue", "typescript"]
})

// Access the whole array
form.tags.$control.state.value // ["javascript", "vue", "typescript"]

// Access individual elements
form.tags[0].$control.state.value // "javascript"
form.tags[1].$control.state.value // "vue"

// Array operations
form.tags.$control.add("react") // Append an item
form.tags.$control.remove(0) // Remove item at index
form.tags.$control.moveItem(0, 2) // Reorder items
```

Arrays of objects work the same way:

```ts
const { form } = useForm({
  users: [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
})

form.users[0].name.$control.state.value // "John"
form.users[1].age.$control.state.value // 25
```

### Iterating Over Arrays

Array form nodes are iterable, so you can loop over them in templates or scripts:

```vue
<template>
  <div v-for="(member, index) in form.teamMembers" :key="index">
    <input v-model="member.name.$control.state.value" />
    <button @click="form.teamMembers.$control.remove(index)">Remove</button>
  </div>
  <button @click="form.teamMembers.$control.add()">Add Member</button>
</template>
```

Or in script:

```ts
for (const item of form.items) {
  console.log(item.$control.state.value)
}
```

## Validation

### Standard Schema Support

`vue-reactive-form` supports [Standard Schema](https://github.com/standard-schema/standard-schema) (`@standard-schema/spec`), making it compatible with popular validation libraries like **Yup**, **Zod**, and **Valibot** out of the box.

```vue
<script setup lang="ts">
import { useForm } from "@vue-reactive-form/core"
import { object, string } from "yup"

const schema = object({
  name: string().required("Name is required"),
  email: string().email("Invalid email").required("Email is required")
})

const { form, handleSubmit } = useForm(
  { name: "", email: "" },
  { validationSchema: schema }
)

const onSubmit = handleSubmit({
  onSuccess: (data) => console.log("Valid:", data),
  onError: (errors) => console.log("Errors:", errors)
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Name</label>
      <input v-model="form.name.$control.state.value" type="text" />
      <span v-if="!form.name.$control.isValid.value">
        {{ form.name.$control.errorMessages.value.join(", ") }}
      </span>
    </div>

    <div>
      <label>Email</label>
      <input v-model="form.email.$control.state.value" type="email" />
      <span v-if="!form.email.$control.isValid.value">
        {{ form.email.$control.errorMessages.value.join(", ") }}
      </span>
    </div>

    <button type="submit">Submit</button>
  </form>
</template>
```

### Reactive Validation Schema

The validation schema can be a `Ref`, allowing you to swap schemas dynamically at runtime:

```ts
import { ref } from "vue"
import { useForm } from "@vue-reactive-form/core"
import * as yup from "yup"

const lenientSchema = yup.object({ name: yup.string() })
const strictSchema = yup.object({
  name: yup.string().required("Name is required")
})

const schemaRef = ref(lenientSchema)

const { form, validate } = useForm(
  { name: "" },
  { validationSchema: schemaRef }
)

// Validates successfully with lenient schema
await validate() // ✅ { name: "" }

// Switch to strict schema
schemaRef.value = strictSchema

// Now validation fails
await validate() // ❌ undefined - form.name.$control.errorMessages.value === ["Name is required"]
```

You can even start with `undefined` and set a schema later:

```ts
const schemaRef = ref(undefined)
const { validate } = useForm({ name: "" }, { validationSchema: schemaRef })

await validate() // ✅ Returns state as-is (no schema = no validation)

schemaRef.value = yup.object({ name: yup.string().required("Required") })
await validate() // ❌ Now validates against the schema
```

### Handling Validation Errors

When validation fails, errors are automatically distributed to each field's `$control`:

```ts
const { form, validate } = useForm(
  { name: "", age: -5 },
  {
    validationSchema: yup.object({
      name: yup.string().required("Name is required"),
      age: yup.number().min(0, "Age must be positive")
    })
  }
)

await validate()

form.name.$control.isValid.value // false
form.name.$control.errorMessages.value // ["Name is required"]

form.age.$control.isValid.value // false
form.age.$control.errorMessages.value // ["Age must be positive"]
```

> **Note:** When you update a field's state, its validation errors are automatically cleared. Errors won't persist until the next validation is performed.

```ts
form.name.$control.state.value = "John"
form.name.$control.isValid.value // true (errors cleared)
form.name.$control.errorMessages.value // [] (cleared on change)
```

## Submitting

Use `handleSubmit` to create a submit handler with `onSuccess` and `onError` callbacks:

```ts
const { handleSubmit } = useForm({ name: "John" }, { validationSchema: schema })

const onSubmit = handleSubmit({
  onSuccess: (validatedState) => {
    // Called when validation passes
    // validatedState is the output of the validation schema
    console.log("Submitted:", validatedState)
  },
  onError: (errors) => {
    // Called when validation fails
    // errors is a Record<string, ValidationIssue[]>
    console.log("Errors:", errors)
  }
})
```

Bind it to a form's submit event:

```html
<form @submit="onSubmit">
  <!-- ... -->
</form>
```

The handler automatically calls `event.preventDefault()` when an `Event` argument is passed. When no validation schema is provided, `onSuccess` is called with the current form state.

**Touched on submit:** When `handleSubmit` is called, all fields that have been accessed through the form tree are automatically marked as `touched` — before validation runs.

```ts
form.name.$control.touched.value // false
form.email.$control.touched.value // false

await onSubmit()

form.name.$control.touched.value // true
form.email.$control.touched.value // true
```

## API

### `useForm(defaultState, options?)`

The main composable. Creates the form tree and returns a [`FormRoot`](#formroot).

```ts
import { useForm } from "@vue-reactive-form/core"

const { form, errors, validate, handleSubmit } = useForm(defaultState, options)
```

**Parameters:**

| Parameter      | Type                                      | Description                                                                                          |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `defaultState` | `PartialOrPrimitive<TState>`              | The initial form state. Can be a primitive, object, or array. Object properties are deeply optional. |
| `options`      | `UseFormOptions<TState, TValidatedState>` | Optional configuration object.                                                                       |

**Options:**

| Option             | Type                                      | Description                                                                                                  |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `validationSchema` | `MaybeRef<StandardSchemaV1 \| undefined>` | A Standard Schema–compatible validation schema. Can be a plain value or a `Ref` for dynamic schema swapping. |

---

### `FormRoot`

The object returned by `useForm`. Contains the form tree and methods for validation and submission.

```ts
type FormRoot<TState, TValidatedState = TState> = {
  form: FormNode<RequiredOrPrimitive<TState>>
  errors: Ref<FormErrors>
  validate: () => Promise<TValidatedState | undefined>
  handleSubmit: HandleFormSubmit<TValidatedState>
}
```

#### `FormRoot.form`

The root of the form tree. Provides navigation to all nested fields via proxy-based access. The state type is deeply required to ensure navigation is always possible.

```ts
const { form } = useForm({ user: { name: "John" } })
form.user.name.$control.state.value // "John"
```

#### `FormRoot.errors`

A `Ref` containing all validation errors keyed by dot-notation paths:

```ts
type FormErrors = Record<string, ValidationIssue[]>
```

```ts
const { errors, validate } = useForm({ name: "" }, { validationSchema: schema })

await validate()
errors.value
// {
//   "name": [{ message: "Name is required", path: ["name"] }]
// }
```

#### `FormRoot.validate()`

Imperatively runs validation against the current state. Returns the validated state on success, or `undefined` on failure. Errors are populated in `errors` and distributed to each field's `$control`.

```ts
const result = await validate()

if (result) {
  console.log("Valid:", result)
} else {
  console.log("Validation failed")
}
```

#### `FormRoot.handleSubmit(options?)`

Creates a submit handler function. Returns an `async (event?: Event) => void` function suitable for binding to form submit events.

```ts
type HandleSubmitOptions<TValidatedState> = {
  onSuccess?: (state: TValidatedState) => void
  onError?: (errors: FormErrors) => void
}
```

```ts
const onSubmit = handleSubmit({
  onSuccess: (state) => {
    /* handle valid submission */
  },
  onError: (errors) => {
    /* handle validation errors */
  }
})
```

---

### `FormNode`

A node in the form tree. The concrete type depends on the value type:

| Value Type                           | Node Type              | Description                                                         |
| ------------------------------------ | ---------------------- | ------------------------------------------------------------------- |
| Primitive (`string`, `number`, etc.) | `PrimitiveFormNode<T>` | Has `$control` only                                                 |
| Plain object                         | `ObjectFormNode<T>`    | Has `$control` + named child nodes for each property                |
| Array                                | `ArrayFormNode<T>`     | Has `$control` (with array methods) + indexed child nodes, iterable |

All form nodes expose a `$control` property. Object and array nodes also allow further navigation into their children.

```ts
// PrimitiveFormNode - leaf node
form.name.$control

// ObjectFormNode - navigate deeper
form.user.$control // control for the entire user object
form.user.name.$control // control for user.name

// ArrayFormNode - index or iterate
form.tags.$control // control for the entire array (with add/remove/moveItem)
form.tags[0].$control // control for the first element
for (const tag of form.tags) {
  /* ... */
}
```

---

### `InputControl`

The core interface exposed by every form node's `$control`. Provides reactive state, validation status, and mutation methods.

```ts
type InputControl<T> = {
  state: Ref<PartialOrPrimitive<T> | undefined>
  defaultState: ComputedRef<PartialOrPrimitive<T> | undefined>
  dirty: ComputedRef<boolean>
  touched: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  errorMessages: ComputedRef<string[]>
  clear: () => void
  reset: () => void
  updateDefaultState: (newDefault?: PartialOrPrimitive<T>) => void
  setAsTouched: () => void
}
```

#### `InputControl.state`

A writable `Ref` holding the current value of the field. Use with `v-model` for two-way binding.

```ts
form.name.$control.state.value // read
form.name.$control.state.value = "Jane" // write
```

> When the state is updated, any existing validation errors for that field are automatically cleared.

#### `InputControl.defaultState`

A read-only `ComputedRef` holding the default/initial value of the field. Used internally for dirty checking.

```ts
form.name.$control.defaultState.value // "John" (initial value)
```

#### `InputControl.dirty`

A `ComputedRef<boolean>` that is `true` when the current value differs from the default value. Uses deep equality for objects.

```ts
form.name.$control.dirty.value // false initially

form.name.$control.state.value = "Jane"
form.name.$control.dirty.value // true
```

#### `InputControl.touched`

A `ComputedRef<boolean>` that is `true` after `setAsTouched()` has been called. Useful for showing validation errors only after user interaction.

```ts
form.name.$control.touched.value // false

form.name.$control.setAsTouched()
form.name.$control.touched.value // true
```

> **Note:** When using `handleSubmit`, all accessed fields are automatically marked as touched before validation. This means you can safely gate error visibility behind `touched` — errors will appear for all fields after the first submit attempt.

#### `InputControl.isValid`

A `ComputedRef<boolean>` that is `true` when there are no validation errors for this field.

```ts
// Before validation
form.name.$control.isValid.value // true

// After failed validation
await validate()
form.name.$control.isValid.value // false
```

#### `InputControl.errorMessages`

A `ComputedRef<string[]>` containing all validation error messages for this field.

```ts
await validate()
form.name.$control.errorMessages.value // ["Name is required"]
```

#### `InputControl.clear()`

Sets the field's state to `undefined`.

```ts
form.name.$control.clear()
form.name.$control.state.value // undefined
```

#### `InputControl.reset()`

Resets the field's state back to its default value.

```ts
form.name.$control.state.value = "modified"
form.name.$control.reset()
form.name.$control.state.value // "John" (back to default)
form.name.$control.dirty.value // false
```

#### `InputControl.updateDefaultState(newDefault?)`

Updates the default value for the field. Use with caution - changing the default affects dirty checking.

```ts
form.name.$control.updateDefaultState("New Default")
form.name.$control.defaultState.value // "New Default"
```

#### `InputControl.setAsTouched()`

Marks the field as touched. Typically called on blur events to track user interaction.

```html
<input
  v-model="form.name.$control.state.value"
  @blur="form.name.$control.setAsTouched()"
/>
```

---

### `ArrayInputControl`

Extends [`InputControl`](#inputcontrol) with array-specific methods. Exposed by `$control` on array form nodes.

```ts
type ArrayInputControl<T extends unknown[]> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}
```

#### `ArrayInputControl.add(defaultValue?)`

Appends a new item to the array. Optionally accepts a default value for the new item.

```ts
form.tags.$control.add() // adds undefined
form.tags.$control.add("new-tag") // adds "new-tag"

// For arrays of objects
form.users.$control.add({ name: "", age: 0 })
```

#### `ArrayInputControl.remove(index)`

Removes the item at the given index.

```ts
form.tags.$control.remove(0) // removes first item
```

#### `ArrayInputControl.moveItem(fromIndex, toIndex)`

Moves an item from one position to another. Indices are clamped to array bounds.

```ts
// Move first item to third position
form.tags.$control.moveItem(0, 2)
```

---

## TypeScript

### Typed Forms

`useForm` infers the form state type from the default state you provide:

```ts
const { form } = useForm({ name: "John", age: 30 })

form.name.$control.state.value // string | undefined - fully typed
form.age.$control.state.value // number | undefined - fully typed
```

For forms where the initial state may be partial, provide a type parameter:

```ts
type UserForm = {
  name: string
  email: string
  age: number
}

const { form } = useForm<UserForm>({})

form.name.$control.state.value // string | undefined
form.email.$control.state.value // string | undefined
```

### Separate Input and Output Types

When using a validation schema, the validated output type may differ from the input type. Use two type parameters to represent this:

```ts
type FormInput = {
  name?: string
  email?: string
}

type FormOutput = {
  name: string
  email: string
}

const { form, handleSubmit } = useForm<FormInput, FormOutput>(
  {},
  { validationSchema: schema }
)

const onSubmit = handleSubmit({
  onSuccess: (state) => {
    // state is typed as FormOutput - name and email are guaranteed strings
    console.log(state.name, state.email)
  }
})
```

### Exported Types

All public types are available as named exports:

```ts
import type {
  // Form root & options
  FormRoot,
  UseFormOptions,
  FormErrors,
  HandleSubmitOptions,
  HandleFormSubmit,

  // Controls
  InputControl,
  ArrayInputControl,

  // Form tree nodes
  FormNode,
  ArrayFormNode
} from "@vue-reactive-form/core"
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements or find any bugs.

## License

The package is published under the MIT license.
