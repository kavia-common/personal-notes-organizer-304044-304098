<template>
  <div class="editor">
    <div v-if="!note" class="empty">
      <div class="empty-title">No note selected</div>
      <p class="muted">Create a new note to get started.</p>
      <button class="btn btn-primary" type="button" @click="$emit('create')">
        <span class="btn-dot" aria-hidden="true"></span>
        New note
      </button>
    </div>

    <div v-else>
      <div class="topbar">
        <div class="meta">
          <div class="muted small">
            Last updated: <strong>{{ formatFull(note.updatedAt) }}</strong>
          </div>
          <div class="muted small">
            Tags: <span v-if="note.tags.length">{{ note.tags.join(', ') }}</span><span v-else>none</span>
          </div>
        </div>

        <div class="top-actions">
          <button class="btn btn-small" type="button" @click="togglePreview">
            {{ previewMode ? 'Edit' : 'Preview' }}
          </button>
          <button class="btn btn-small btn-danger" type="button" @click="confirmDelete(note.id)">
            Delete
          </button>
        </div>
      </div>

      <div class="fields">
        <label class="sr-only" for="title">Title</label>
        <input
          id="title"
          ref="titleEl"
          v-model="draftTitle"
          class="input title"
          type="text"
          placeholder="Note title"
          @input="scheduleSave"
        />

        <label class="sr-only" for="tags">Tags</label>
        <input
          id="tags"
          v-model="draftTags"
          class="input"
          type="text"
          placeholder="Tags (comma-separated) e.g. ideas, work, personal"
          @input="scheduleSave"
        />

        <div v-if="!previewMode" class="body">
          <label class="sr-only" for="body">Body</label>
          <textarea
            id="body"
            v-model="draftBody"
            class="textarea"
            placeholder="Write your note… (Markdown supported in Preview)"
            @input="scheduleSave"
          />
        </div>

        <div v-else class="preview" aria-label="Markdown preview">
          <div class="preview-inner" v-html="rendered"></div>
        </div>

        <div class="status-row">
          <span class="muted small">
            {{ savingState }}
          </span>
          <span class="muted small">
            {{ shortcutHint }}
          </span>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="pendingDeleteId"
      title="Delete note?"
      :message="deleteMessage"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="doDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import type { Note } from '~/composables/useNotesStore'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  note: Note | null
  focusTitleRequestId: number
}>()

const emit = defineEmits<{
  (e: 'update', payload: { id: string; title?: string; body?: string; tags?: string[] }): void
  (e: 'create'): void
  (e: 'delete', id: string): void
  (e: 'request-focus-title'): void
}>()

const titleEl = ref<HTMLInputElement | null>(null)

const draftTitle = ref('')
const draftBody = ref('')
const draftTags = ref('')

const previewMode = ref(false)

const saveTimer = ref<number | null>(null)
const lastSavedAt = ref<number | null>(null)
const dirty = ref(false)

const savingState = computed(() => {
  if (!props.note) return ''
  if (dirty.value) return 'Editing… autosave pending'
  if (!lastSavedAt.value) return 'Autosave enabled'
  return `Saved ${formatRelative(lastSavedAt.value)}`
})

const shortcutHint = computed(() => {
  const mac = import.meta.client ? /Mac|iPhone|iPad|iPod/.test(navigator.platform) : false
  return mac ? '⌘N new • ⌘S save' : 'Ctrl+N new • Ctrl+S save'
})

const rendered = computed(() => {
  const src = draftBody.value ?? ''
  return renderMarkdown(src)
})

function formatFull(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(ts: number): string {
  const delta = Date.now() - ts
  if (delta < 3_000) return 'just now'
  if (delta < 60_000) return `${Math.round(delta / 1000)}s ago`
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`
  return `${Math.round(delta / 3_600_000)}h ago`
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

function scheduleSave() {
  if (!props.note) return
  dirty.value = true

  if (saveTimer.value) window.clearTimeout(saveTimer.value)
  saveTimer.value = window.setTimeout(() => {
    doSave()
  }, 350)
}

function doSave() {
  if (!props.note) return
  emit('update', {
    id: props.note.id,
    title: draftTitle.value,
    body: draftBody.value,
    tags: parseTags(draftTags.value),
  })
  dirty.value = false
  lastSavedAt.value = Date.now()
}

function togglePreview() {
  previewMode.value = !previewMode.value
}

watch(
  () => props.note?.id,
  () => {
    // Load drafts from selected note
    const n = props.note
    if (!n) return
    draftTitle.value = n.title
    draftBody.value = n.body
    draftTags.value = n.tags.join(', ')
    previewMode.value = false
    dirty.value = false
    lastSavedAt.value = null
  },
  { immediate: true },
)

watch(
  () => props.focusTitleRequestId,
  () => {
    // Focus title programmatically when requested.
    if (!import.meta.client) return
    window.setTimeout(() => titleEl.value?.focus(), 0)
  },
)

const pendingDeleteId = ref<string | null>(null)
const deleteMessage = computed(() => {
  const n = props.note
  if (!n) return 'This will permanently remove the selected note.'
  return `This will permanently remove “${n.title || 'Untitled note'}”.`
})

function confirmDelete(id: string) {
  pendingDeleteId.value = id
}

function doDelete() {
  if (pendingDeleteId.value) {
    const id = pendingDeleteId.value
    pendingDeleteId.value = null
    emit('delete', id)
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.editor {
  min-height: 520px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.meta {
  display: grid;
  gap: 0.25rem;
}
.small {
  font-size: 0.9rem;
}
.top-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fields {
  display: grid;
  gap: 0.75rem;
}

.title {
  font-weight: 750;
  letter-spacing: -0.02em;
}

.preview {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  padding: 0.85rem 0.95rem;
  min-height: 220px;
}
.preview-inner :deep(h1) {
  font-size: 1.35rem;
  margin: 0.2rem 0 0.75rem;
}
.preview-inner :deep(h2) {
  font-size: 1.15rem;
  margin: 1rem 0 0.5rem;
}
.preview-inner :deep(h3) {
  font-size: 1.05rem;
  margin: 1rem 0 0.35rem;
}
.preview-inner :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}
.preview-inner :deep(blockquote) {
  margin: 0.75rem 0;
  padding: 0.6rem 0.75rem;
  border-left: 4px solid color-mix(in srgb, var(--primary) 55%, var(--border));
  background: color-mix(in srgb, var(--surface-2) 60%, rgba(37, 99, 235, 0.05));
  border-radius: 12px;
}
.preview-inner :deep(code) {
  padding: 0.1rem 0.35rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface-2) 70%, rgba(17, 24, 39, 0.03));
}
.preview-inner :deep(pre) {
  padding: 0.8rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface-2) 70%, rgba(17, 24, 39, 0.03));
  overflow: auto;
}
.preview-inner :deep(ul) {
  margin: 0.5rem 0 0.5rem 1.2rem;
}
.preview-inner :deep(a) {
  color: var(--primary);
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.empty {
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem 1rem;
  background: color-mix(in srgb, var(--surface) 75%, rgba(37, 99, 235, 0.04));
}
.empty-title {
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: 1.2rem;
}
</style>
