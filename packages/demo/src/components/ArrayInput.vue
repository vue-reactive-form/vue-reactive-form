<script setup lang="ts" generic="TComponentGeneric extends any[]">
import type { ArrayFormNode } from "@nano-form/vue"

type Props<T extends any[]> = {
  label: string
  node: ArrayFormNode<T>
  errors?: string[]
}

defineProps<Props<TComponentGeneric>>()
</script>

<template>
  <div class="array-input">
    <div class="header">
      <span class="label">{{ label }}</span>
      <button class="btn-secondary" type="button" @click="node.$control.add()">
        Add item
      </button>
    </div>

    <div v-if="errors?.length" class="error-container">
      <div v-for="error in errors" :key="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div class="items-container">
      <div v-for="(childNode, index) in node" class="item-row" :key="index">
        <slot :node="childNode" />

        <button
          class="btn-delete"
          type="button"
          @click="node.$control.remove(index)"
          :key="index + 100000"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.array-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem; /* Less padding */
  border: 1px dashed #d1d5db;
  background-color: #fafafa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.label {
  font-family: var(--b-font-ui);
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--b-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-container {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.7rem;
  font-family: var(--b-font-mono);
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Tighter items */
}

.item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: white;
  padding: 0.75rem;
  border: 1px solid var(--b-border);
  position: relative;
}

.item-row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #e5e7eb;
  transition: background-color 0.2s;
}

.item-row:hover::before {
  background-color: var(--b-accent);
}

button {
  cursor: pointer;
  border: none;
  border-radius: 0;
  font-family: var(--b-font-mono);
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.btn-secondary {
  background-color: white;
  border: 1px solid var(--b-border);
  color: var(--b-text);
}

.btn-secondary:hover {
  border-color: var(--b-accent);
  background-color: #f9fafb;
}

.btn-delete {
  background-color: transparent;
  color: #9ca3af;
  font-size: 1rem;
  padding: 0.25rem;
  margin-top: 1.25rem; /* Re-aligned */
  line-height: 1;
}

.btn-delete:hover {
  color: #ef4444;
  background-color: #fef2f2;
}
</style>
