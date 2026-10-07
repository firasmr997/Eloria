import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'

interface ListEditorProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  max?: number
  hint?: string
}

/** Edits a short ordered list of lines (benefits, aftercare, specialties): add, reorder, remove. */
export function ListEditor({ label, items, onChange, placeholder, max = 20, hint }: ListEditorProps) {
  const [draft, setDraft] = useState('')
  const id = useId()

  const add = () => {
    const value = draft.trim()
    if (!value || items.length >= max) return
    onChange([...items, value])
    setDraft('')
  }
  const move = (i: number, d: -1 | 1) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption text-ink-muted">
        {label}
      </label>
      {items.length > 0 && (
        <ol className="rounded-xs border border-line bg-porcelain">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="flex items-center gap-2 border-b border-line px-3 py-2 last:border-b-0">
              <span className="w-5 shrink-0 text-[0.75rem] text-taupe tabular">{i + 1}</span>
              <input
                value={item}
                onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
                aria-label={`${label} item ${i + 1}`}
                className="min-w-0 flex-1 bg-transparent text-small text-ink focus:outline-none"
              />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-taupe hover:text-ink disabled:opacity-30" aria-label={`Move item ${i + 1} up`}>
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 text-taupe hover:text-ink disabled:opacity-30" aria-label={`Move item ${i + 1} down`}>
                <ArrowDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-taupe hover:text-error" aria-label={`Remove item ${i + 1}`}>
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          maxLength={300}
          disabled={items.length >= max}
          className="h-10 min-w-0 flex-1 rounded-xs border border-line-strong bg-porcelain px-3 text-small text-ink placeholder:text-taupe focus:border-champagne-deep focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || items.length >= max}
          className="inline-flex h-10 items-center gap-1.5 rounded-xs border border-line-strong px-3 text-small text-ink hover:border-espresso disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden /> Add
        </button>
      </div>
      {hint && <p className="text-small text-ink-muted">{hint}</p>}
    </div>
  )
}
