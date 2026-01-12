/**
 * Minimal, safe-ish markdown renderer (no raw HTML support).
 * This intentionally supports only a small subset for local preview:
 * headings, bold, italic, inline code, code blocks, blockquotes, links, lists, paragraphs.
 */

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderInline(text: string): string {
  // Escape first to prevent HTML injection.
  let out = escapeHtml(text)

  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic *text*
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Links [label](url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

  return out
}

/**
 * PUBLIC_INTERFACE
 * Render a limited markdown subset to HTML (no raw HTML).
 */
export function renderMarkdown(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')

  let html = ''
  let inCode = false
  let codeBuffer: string[] = []
  let inUl = false

  const flushUl = () => {
    if (inUl) {
      html += '</ul>'
      inUl = false
    }
  }

  for (const line of lines) {
    // fenced code blocks
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        flushUl()
        inCode = true
        codeBuffer = []
      } else {
        const code = escapeHtml(codeBuffer.join('\n'))
        html += `<pre><code>${code}</code></pre>`
        inCode = false
        codeBuffer = []
      }
      continue
    }

    if (inCode) {
      codeBuffer.push(line)
      continue
    }

    const trimmed = line.trim()

    if (!trimmed) {
      flushUl()
      continue
    }

    // headings
    if (trimmed.startsWith('### ')) {
      flushUl()
      html += `<h3>${renderInline(trimmed.slice(4))}</h3>`
      continue
    }
    if (trimmed.startsWith('## ')) {
      flushUl()
      html += `<h2>${renderInline(trimmed.slice(3))}</h2>`
      continue
    }
    if (trimmed.startsWith('# ')) {
      flushUl()
      html += `<h1>${renderInline(trimmed.slice(2))}</h1>`
      continue
    }

    // blockquote
    if (trimmed.startsWith('> ')) {
      flushUl()
      html += `<blockquote>${renderInline(trimmed.slice(2))}</blockquote>`
      continue
    }

    // unordered list
    if (trimmed.startsWith('- ')) {
      if (!inUl) {
        flushUl()
        inUl = true
        html += '<ul>'
      }
      html += `<li>${renderInline(trimmed.slice(2))}</li>`
      continue
    }

    flushUl()
    html += `<p>${renderInline(trimmed)}</p>`
  }

  flushUl()
  return html
}
