<template>
  <div class="list">
    <div class="list-top">
      <div class="list-title">
        <div class="h">Notes</div>
        <div class="muted s">{{ filteredNotes.length }} shown</div>
      </div>

      <button class="btn btn-primary btn-small" type="button" @click="$emit('create')">
        <span class="btn-dot" aria-hidden="true"></span>
        New
      </button>
    </div>

    <div class="controls">
      <label class="sr-only" for="search">Search notes</label>
      <input
        id="search"
        v-model="query"
        class="input"
        type="search"
        placeholder="Search title, body, tags…"
        autocomplete="off"
      />

      <div class="filters">
        <div class="filter-row">
          <div class="muted label">Tag</div>
          <select v-model="tagFilter" class="select" aria-label="Filter by tag">
            <option value="">All tags</option>
            <option v-for="t in allTags" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </div>

        <div class="filter-row">
          <div class="muted label">Sort</div>
          <select v-model="sortMode" class="select" aria-label="Sort notes">
            <option value="updatedDesc">Recently updated</option>
            <option value="titleAsc">Title (A–Z)</option>
          </select>
        </div>
      </div>
    </div>

    <hr class="hr" />

    <div v-if="filteredNotes.length === 0" class="empty muted">
      No notes match your filters.
    </div>

    <ul class="items" v-else>
      <li v-for="note in filteredNotes" :key="note.id">
        <button
          class="item"
          type="button"
          :class="{ active: note.id === selectedId }"
          @click="$emit('select', note.id)"
        >
          <div class="item-head">
            <div class="item-title" :title="note.title">{{ note.title || 'Untitled note' }}</div>
            <div class="item-time muted">{{ formatTime(note.updatedAt) }}</div>
          </div>
          <div class="item-body muted">
            {{ preview(note.body) }}
          </div>
          <div v-if="note.tags.length" class="item-tags" aria-label="Note tags">
            <span v-for="t in note.tags.slice(0, 3)" :key="t" class="badge">
              {{ t }}
            </span>
            <span v-if="note.tags.length > 3" class="muted more">+{{ note.tags.length - 3 }}</span>
          </div>
        </button>

        <div class="row-actions">
          <button class="btn btn-icon" type="button" :aria-label="`Delete ${note.title}`" @click="confirmDelete(note.id)">
            <span aria-hidden="true">🗑</span>
          </button>
        </div>
      </li>
    </ul>

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
import { computed, ref } from 'vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import { useNotesStore, type Note } from '~/composables/useNotesStore'

defineProps<{
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'create'): void
  (e: 'delete', id: string): void
}>()

const store = useNotesStore()

const query = ref('')
const tagFilter = ref('')
const sortMode = ref<'updatedDesc' | 'titleAsc'>('updatedDesc')

const allTags = computed(() => store.allTags.value)

function preview(body: string): string {
  const oneLine = body.replace(/\s+/g, ' ').trim()
  return oneLine.slice(0, 90) || '—'
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

const sortedNotes = computed<Note[]>(() => {
  const base = store.notesByUpdatedDesc.value
  if (sortMode.value === 'updatedDesc') return base
  return [...base].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
})

const filteredNotes = computed<Note[]>(() => {
  const q = normalize(query.value)
  const tag = normalize(tagFilter.value)

  return sortedNotes.value.filter(n => {
    if (tag && !n.tags.some(t => normalize(t) === tag)) return false
    if (!q) return true

    const hay = `${n.title}\n${n.body}\n${n.tags.join(' ')}`.toLowerCase()
    return hay.includes(q)
  })
})

const pendingDeleteId = ref<string | null>(null)
const deleteMessage = computed(() => {
  const note = store.notes.value.find(n => n.id === pendingDeleteId.value)
  return note ? `This will permanently remove “${note.title || 'Untitled note'}”.` : 'This will permanently remove this note.'
})

function confirmDelete(id: string) {
  pendingDeleteId.value = id
}

function doDelete() {
  if (pendingDeleteId.value) {
    const id = pendingDeleteId.value
    pendingDeleteId.value = null
    // Emit upward so parent can handle selection updates centrally if desired.
    // Store is singleton, so either way works; this keeps flow explicit.
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

.list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.list-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.list-title .h {
  font-weight: 750;
  letter-spacing: -0.02em;
}
.list-title .s {
  font-size: 0.9rem;
}

.controls {
  display: grid;
  gap: 0.75rem;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
@media (max-width: 860px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

.filter-row {
  display: grid;
  gap: 0.35rem;
}
.label {
  font-size: 0.86rem;
}

.select {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 0.55rem 0.75rem;
  box-shadow: var(--shadow-sm);
}
.select:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--primary) 45%, transparent);
  outline-offset: 3px;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.items li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: start;
}

.item {
  text-align: left;
  width: 100%;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(255, 255, 255, 0.0));
  border-radius: 14px;
  padding: 0.75rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}
.item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.item.active {
  border-color: color-mix(in srgb, var(--primary) 55%, var(--border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), var(--shadow-md);
}
.item:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--primary) 45%, transparent);
  outline-offset: 3px;
}

.item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.item-title {
  font-weight: 700;
  letter-spacing: -0.015em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-time {
  font-size: 0.82rem;
  white-space: nowrap;
}
.item-body {
  margin-top: 0.25rem;
  font-size: 0.92rem;
}
.item-tags {
  margin-top: 0.55rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}
.more {
  font-size: 0.85rem;
}

.row-actions {
  display: flex;
  align-items: center;
}

.empty {
  padding: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: 14px;
}
</style>
