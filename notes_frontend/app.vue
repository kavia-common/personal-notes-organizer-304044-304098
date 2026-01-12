<template>
  <div class="app-root">
    <a class="skip-link" href="#main">Skip to content</a>

    <AppHeader />

    <main id="main" class="app-main" tabindex="-1">
      <NotesApp />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import NotesApp from '~/components/NotesApp.vue'
</script>

<style>
/* Keep app.vue style minimal; main styling is in assets/css/main.css */
.app-root {
  min-height: 100vh;
}
.app-main {
  min-height: calc(100vh - var(--header-height));
}
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-md);
  transform: translateY(-150%);
  transition: transform 160ms ease;
  z-index: 50;
}
.skip-link:focus {
  transform: translateY(0);
  outline: 3px solid color-mix(in srgb, var(--primary) 45%, transparent);
  outline-offset: 3px;
}
</style>
