<template>
  <header class="header">
    <div class="container header-inner">
      <div class="brand" aria-label="App title">
        <div class="brand-mark" aria-hidden="true">
          <span class="dot dot-primary"></span>
          <span class="dot dot-secondary"></span>
        </div>
        <div class="brand-text">
          <div class="title">Ocean Notes</div>
          <div class="subtitle">
            Local-first notes with tags, search, and autosave.
            <span class="kbd-hint">
              <span class="muted">Shortcuts:</span>
              <kbd>{{ isMac ? '⌘' : 'Ctrl' }}N</kbd> new,
              <kbd>{{ isMac ? '⌘' : 'Ctrl' }}S</kbd> save
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <a class="btn btn-small" href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noreferrer">
          Markdown guide
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const isMac = computed(() => {
  if (!import.meta.client) return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--header-height);
  background: color-mix(in srgb, var(--surface) 80%, rgba(255, 255, 255, 0.3));
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(245, 158, 11, 0.12));
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  display: grid;
  place-items: center;
  position: relative;
}
.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.dot-primary {
  background: var(--primary);
  left: 10px;
  top: 12px;
}
.dot-secondary {
  background: var(--secondary);
  right: 10px;
  bottom: 12px;
}
.brand-text {
  min-width: 0;
}
.title {
  font-weight: 750;
  letter-spacing: -0.02em;
}
.subtitle {
  font-size: 0.92rem;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.kbd-hint {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
