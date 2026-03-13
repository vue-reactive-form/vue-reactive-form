<script setup lang="ts" generic="T">
import type { InputHTMLAttributes } from "vue"

interface Props {
  label: string
  type: InputHTMLAttributes["type"]
  errors?: string[]
}

const modelValue = defineModel<T>()

defineProps<Props>()

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="labeled-input">
    <label>
      <div class="label-text">{{ label }}</div>
      <input v-model="modelValue" :type class="input-field" v-bind="$attrs" />
    </label>
    <div v-if="errors?.length" class="error-container">
      <div v-for="error in errors" :key="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.labeled-input {
  display: flex;
  flex-direction: column;
}

.label-text {
  font-family: var(--b-font-ui);
  font-size: 0.75rem; /* Smaller label */
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #4b5563; /* Slightly lighter for less visual weight */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-field {
  width: 100%;
  padding: 0.4rem 0.5rem; /* Tighter padding */
  border: 1px solid var(--b-border);
  background-color: #f9fafb;
  border-radius: 0;
  font-family: var(--b-font-mono);
  font-size: 0.8125rem; /* Smaller monospace font */
  box-sizing: border-box;
  color: var(--b-text);
  transition: all 0.2s ease;
  height: 2rem; /* Fixed compact height */
}

.input-field:focus {
  border-color: var(--b-accent);
  background-color: #ffffff;
  outline: 1px solid var(--b-accent);
  outline-offset: -1px;
}

.input-field::placeholder {
  color: #9ca3af;
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
</style>
