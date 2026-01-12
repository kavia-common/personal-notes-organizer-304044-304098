import { computed, ref, watch } from 'vue'

export type Note = {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

type PersistedState = {
  version: 1
  notes: Note[]
  selectedId: string | null
}

const STORAGE_KEY = 'ocean-notes:v1'

function now(): number {
  return Date.now()
}

function uid(): string {
  // Good enough for local-only notes; avoids external libs.
  return `${now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeTags(input: string[]): string[] {
  const cleaned = input
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.replace(/\s+/g, '-').toLowerCase())

  // Unique, stable order
  return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b))
}

function seedNotes(): Note[] {
  const t = now()
  return [
    {
      id: uid(),
      title: 'Welcome to Ocean Notes',
      body:
        `This is a local-first notes app.\n\n` +
        `- Create notes with **${'tags'}**\n` +
        `- Search + filter\n` +
        `- Autosave while typing\n\n` +
        `Try adding a tag like: \`productivity\` or \`ideas\`.`,
      tags: ['welcome', 'getting-started'],
      createdAt: t - 1000 * 60 * 30,
      updatedAt: t - 1000 * 60 * 5,
    },
    {
      id: uid(),
      title: 'Ocean Professional style checklist',
      body:
        `- Primary: #2563EB (blue)\n` +
        `- Secondary: #F59E0B (amber)\n` +
        `- Rounded corners + subtle shadows\n` +
        `- Minimal UI, smooth transitions\n` +
        `- Responsive split layout`,
      tags: ['design', 'ocean'],
      createdAt: t - 1000 * 60 * 90,
      updatedAt: t - 1000 * 60 * 45,
    },
    {
      id: uid(),
      title: 'Markdown quick tips',
      body:
        `# Title\n\n` +
        `- Use **bold** and *italic*\n` +
        `- Links: [Nuxt](https://nuxt.com)\n\n` +
        `> Optional: switch to Preview to render markdown.`,
      tags: ['markdown', 'tips'],
      createdAt: t - 1000 * 60 * 240,
      updatedAt: t - 1000 * 60 * 240,
    },
  ]
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

// Singleton state across composable calls
const _notes = ref<Note[]>([])
const _selectedId = ref<string | null>(null)
const _hydrated = ref(false)

function persist(): void {
  if (!import.meta.client) return
  const payload: PersistedState = {
    version: 1,
    notes: _notes.value,
    selectedId: _selectedId.value,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function hydrate(): void {
  if (!import.meta.client || _hydrated.value) return

  const parsed = safeParse<PersistedState>(localStorage.getItem(STORAGE_KEY))
  if (parsed && parsed.version === 1 && Array.isArray(parsed.notes)) {
    _notes.value = parsed.notes
    _selectedId.value = parsed.selectedId ?? (parsed.notes[0]?.id ?? null)
  } else {
    _notes.value = seedNotes()
    _selectedId.value = _notes.value[0]?.id ?? null
    persist()
  }

  _hydrated.value = true
}

/**
 * PUBLIC_INTERFACE
 * Local-first notes store (CRUD + persistence). Notes are persisted to localStorage and seeded on first run.
 */
export function useNotesStore() {
  hydrate()

  const notesByUpdatedDesc = computed(() => {
    return [..._notes.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const selectedNote = computed(() => {
    return _notes.value.find(n => n.id === _selectedId.value) ?? null
  })

  const allTags = computed(() => {
    const set = new Set<string>()
    for (const n of _notes.value) {
      for (const tag of n.tags) set.add(tag)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  })

  function selectNote(id: string): void {
    _selectedId.value = id
  }

  function createNote(): Note {
    const t = now()
    const note: Note = {
      id: uid(),
      title: 'Untitled note',
      body: '',
      tags: [],
      createdAt: t,
      updatedAt: t,
    }
    _notes.value = [note, ..._notes.value]
    _selectedId.value = note.id
    persist()
    return note
  }

  function deleteNote(id: string): void {
    const idx = _notes.value.findIndex(n => n.id === id)
    if (idx === -1) return

    const remaining = _notes.value.filter(n => n.id !== id)
    _notes.value = remaining

    if (_selectedId.value === id) {
      _selectedId.value = remaining[0]?.id ?? null
    }
    persist()
  }

  function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'tags'>>): void {
    const idx = _notes.value.findIndex(n => n.id === id)
    if (idx === -1) return

    const current = _notes.value[idx]
    const next: Note = {
      ...current,
      title: patch.title ?? current.title,
      body: patch.body ?? current.body,
      tags: patch.tags ? normalizeTags(patch.tags) : current.tags,
      updatedAt: now(),
    }

    const copy = [..._notes.value]
    copy[idx] = next
    _notes.value = copy
    persist()
  }

  // Persist on selection changes too (so reload restores selection)
  watch(_selectedId, () => persist())

  return {
    notes: _notes,
    notesByUpdatedDesc,
    selectedId: _selectedId,
    selectedNote,
    allTags,

    selectNote,
    createNote,
    updateNote,
    deleteNote,
  }
}
