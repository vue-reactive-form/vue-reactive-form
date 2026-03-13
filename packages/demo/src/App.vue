<script setup lang="ts">
import { useForm } from "@vue-reactive-form/core"
import LabeledInput from "./components/LabeledInput.vue"
import ArrayInput from "./components/ArrayInput.vue"
import {
  projectFormSchema,
  type ProjectFormState,
  type ValidProjectFormState
} from "./demo-form"

const { form, errors, handleSubmit } = useForm<
  ProjectFormState,
  ValidProjectFormState
>({}, { validationSchema: projectFormSchema, validateOn: "blur" })

const onSubmit = handleSubmit({
  onSuccess: (state) => {
    alert("Form submitted with state:\n" + JSON.stringify(state, null, 2))
  },
  onError: (errors) => {
    console.log("Form submission failed with errors:", errors)
  }
})
</script>

<template>
  <div class="container">
    <h1 class="title">vue-reactive-form demo</h1>

    <div class="layout">
      <div class="card form-card">
        <form class="form-layout" @submit.prevent="onSubmit">
          <h2 class="section-title">Form UI</h2>

          <LabeledInput
            label="Name"
            v-bind="form.name.$control.fieldProps"
            :errors="form.name.$control.errorMessages"
            type="text"
          />

          <LabeledInput
            label="Description"
            v-bind="form.description.$control.fieldProps"
            :errors="form.description.$control.errorMessages"
            type="text"
          />

          <LabeledInput
            label="Budget"
            v-bind="form.budget.$control.fieldProps"
            :errors="form.budget.$control.errorMessages"
            type="number"
          />

          <div class="checkbox-wrapper">
            <label class="checkbox-label">
              <input
                :checked="form.isPublic.$control.state"
                type="checkbox"
                @change="
                  (e) =>
                    (form.isPublic.$control.state = (
                      e.target as any
                    ).checked)
                "
                @focus="form.isPublic.$control.fieldProps.onFocus"
                @blur="form.isPublic.$control.fieldProps.onBlur"
              />
              <span>Is public</span>
            </label>
            <div
              v-if="form.isPublic.$control.errorMessages.length"
              class="error-container"
            >
              <div
                v-for="error in form.isPublic.$control.errorMessages"
                :key="error"
                class="error-message"
              >
                {{ error }}
              </div>
            </div>
          </div>

          <LabeledInput
            label="Client name"
            v-bind="form.client.name.$control.fieldProps"
            :errors="form.client.name.$control.errorMessages"
            type="text"
          />

          <LabeledInput
            label="Client street address"
            v-bind="form.client.address.street.$control.fieldProps"
            :errors="form.client.address.street.$control.errorMessages"
            type="text"
          />

          <LabeledInput
            label="Client city"
            v-bind="form.client.address.city.$control.fieldProps"
            :errors="form.client.address.city.$control.errorMessages"
            type="text"
          />

          <ArrayInput
            label="Team members"
            :node="form.teamMembers"
            :errors="form.teamMembers.$control.errorMessages"
          >
            <template #="{ node }">
              <div class="grid-col-2">
                <LabeledInput
                  label="Name"
                  v-bind="node.name.$control.fieldProps"
                  :errors="node.name.$control.errorMessages"
                  type="text"
                />
                <LabeledInput
                  label="Hourly rate"
                  v-bind="node.hourlyRate.$control.fieldProps"
                  :errors="node.hourlyRate.$control.errorMessages"
                  type="number"
                />
              </div>
            </template>
          </ArrayInput>

          <ArrayInput
            label="Tags"
            :node="form.tags"
            :errors="form.tags.$control.errorMessages"
          >
            <template #="{ node }">
              <div class="grid-full">
                <LabeledInput
                  label="Name"
                  v-bind="node.$control.fieldProps"
                  :errors="node.$control.errorMessages"
                  type="text"
                />
              </div>
            </template>
          </ArrayInput>

          <button class="submit-btn" type="submit">Submit</button>
        </form>
      </div>

      <div class="card inspector-card">
        <div class="inspector-section">
          <h2 class="section-title">Form state inspector</h2>
          <pre>{{ form.$control.state }}</pre>
        </div>

        <div class="inspector-section">
          <h2 class="section-title">Form errors inspector</h2>
          <pre>{{ errors }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --b-bg: #f3f4f6;
  --b-surface: #ffffff;
  --b-text: #111827;
  --b-border: #e5e7eb;
  --b-accent: #0f172a;
  --b-highlight: #f59e0b;
  --b-font-ui: "Inter", system-ui, sans-serif;
  --b-font-mono: "Roboto Mono", monospace;
}

body {
  font-family: var(--b-font-ui);
  background-color: var(--b-bg);
  color: var(--b-text);
  margin: 0;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  font-size: 0.8125rem; /* Smaller base font */
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem; /* Reduced padding */
}

.title {
  font-family: var(--b-font-ui);
  text-align: left;
  font-size: 1.25rem; /* Smaller title */
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--b-accent);
  letter-spacing: -0.025em;
  text-transform: uppercase;
  border-bottom: 3px solid var(--b-accent);
  padding-bottom: 0.375rem;
  display: inline-block;
}

.layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem; /* Reduced gap */
  align-items: start;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--b-surface);
  border: 1px solid var(--b-border);
  padding: 1.5rem; /* Reduced padding */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Tighter form elements */
}

.section-title {
  margin-top: 0;
  font-family: var(--b-font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: "//";
  color: var(--b-highlight);
}

.checkbox-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--b-font-ui);
}

.checkbox-label input {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--b-border);
  border-radius: 0;
  background: white;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  position: relative;
}

.checkbox-label input:checked {
  background: var(--b-accent);
  border-color: var(--b-accent);
}

.checkbox-label input:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 3px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.submit-btn {
  background-color: var(--b-accent);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem; /* Smaller padding */
  border-radius: 0;
  font-family: var(--b-font-mono);
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  width: 100%;
}

.submit-btn:hover {
  background-color: #1f2937;
}

.submit-btn:focus {
  outline: 2px solid var(--b-highlight);
  outline-offset: 2px;
}

.inspector-section + .inspector-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--b-border);
}

.inspector-section pre {
  background-color: #f9fafb;
  padding: 0.75rem;
  font-size: 0.7rem; /* Smaller monospace */
  font-family: var(--b-font-mono);
  border: 1px solid var(--b-border);
  margin: 0;
  white-space: pre-wrap;
  color: var(--b-text);
  line-height: 1.3;
}

.error-container {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-top: 0.25rem;
}

.error-message {
  color: #ef4444;
  font-family: var(--b-font-mono);
  font-size: 0.7rem;
}

/* Helpers for ArrayInput slots */
.grid-col-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex: 1;
}

.grid-full {
  flex: 1;
}
</style>
