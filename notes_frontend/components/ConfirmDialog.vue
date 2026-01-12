<template>
  <div class="overlay" role="dialog" aria-modal="true" :aria-label="title" @keydown.esc="$emit('cancel')">
    <div class="panel" ref="panelEl">
      <div class="head">
        <div class="title">{{ title }}</div>
        <button class="btn btn-icon" type="button" aria-label="Close" @click="$emit('cancel')">✕</button>
      </div>

      <p class="message muted">{{ message }}</p>

      <div class="actions">
        <button class="btn" type="button" @click="$emit('cancel')">{{ cancelText }}</button>
        <button class="btn btn-danger" type="button" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  title: string
  message: string
  confirmText: string
  cancelText: string
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const panelEl = ref<HTMLElement | null>(null)

onMounted(() => {
  // Basic focus management: move focus into dialog.
  panelEl.value?.querySelector<HTMLButtonElement>('button')?.focus()
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 100;
}

.panel {
  width: min(520px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1rem;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.title {
  font-weight: 800;
  letter-spacing: -0.02em;
}
.message {
  margin: 0.8rem 0 1rem;
  line-height: 1.6;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}
</style>
