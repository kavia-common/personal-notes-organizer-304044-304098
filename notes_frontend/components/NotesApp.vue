<template>
  <div class="notes-shell">
    <div class="container">
      <div class="notes-grid">
        <section class="card" aria-label="Notes list">
          <div class="card-inner">
            <NotesList
              :selected-id="selectedId"
              @select="selectNote"
              @create="handleCreate"
              @delete="handleDelete"
            />
          </div>
        </section>

        <section class="card" aria-label="Note editor">
          <div class="card-inner">
            <NoteEditor
              :note="selectedNote"
              @update="handleUpdate"
              @create="handleCreate"
              @delete="handleDelete"
              @request-focus-title="focusTitleRequestId++"
              :focus-title-request-id="focusTitleRequestId"
            />
          </div>
        </section>
      </div>

      <p class="footer muted">
        Stored locally in your browser (localStorage). No network calls.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import NotesList from '~/components/NotesList.vue'
import NoteEditor from '~/components/NoteEditor.vue'
import { useNotesStore } from '~/composables/useNotesStore'

const store = useNotesStore()
const { selectedId, selectedNote } = store

const focusTitleRequestId = ref(0)

function handleCreate() {
  const note = store.createNote()
  // On creation, focus title for quick renaming.
  store.selectNote(note.id)
  focusTitleRequestId.value++
}

function handleUpdate(payload: { id: string; title?: string; body?: string; tags?: string[] }) {
  store.updateNote(payload.id, payload)
}

function handleDelete(id: string) {
  store.deleteNote(id)
}

function selectNote(id: string) {
  store.selectNote(id)
}

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null
  if (!node) return false
  const tag = node.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || node.isContentEditable
}

function isMac(): boolean {
  if (!import.meta.client) return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

function onKeydown(e: KeyboardEvent) {
  const mod = isMac() ? e.metaKey : e.ctrlKey
  if (!mod) return

  // Cmd/Ctrl+N : new note
  if (e.key.toLowerCase() === 'n') {
    e.preventDefault()
    handleCreate()
    return
  }

  // Cmd/Ctrl+S : save (note editor already autosaves; here we "commit" and show subtle UX)
  if (e.key.toLowerCase() === 's') {
    e.preventDefault()
    // If not typing, focus title so user sees something happen.
    if (!isTypingTarget(e.target) && selectedNote.value) {
      focusTitleRequestId.value++
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.footer {
  margin: 0.9rem 0 0;
  font-size: 0.92rem;
}
</style>
