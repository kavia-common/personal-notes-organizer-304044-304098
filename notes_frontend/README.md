# Ocean Notes (Nuxt)

A local-first notes app built with Nuxt 3. Notes are stored in your browser using `localStorage` (no backend).

## Features

- Split layout: notes list (left) + editor/preview (right)
- Create / edit / delete notes (with confirmation)
- Search, tag filter, and sort (recently updated / title)
- Autosave while typing
- Optional Markdown preview (minimal built-in renderer)
- Keyboard shortcuts:
  - **Cmd/Ctrl+N**: new note
  - **Cmd/Ctrl+S**: save (autosave is always on)
- Responsive: stacks into a single column on smaller screens
- Seed/demo notes are created on first run for preview

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open: http://localhost:3000

## Production

```bash
npm run build
npm run preview
```
