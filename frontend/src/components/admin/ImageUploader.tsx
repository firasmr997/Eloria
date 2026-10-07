import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState, type DragEvent } from 'react'
import { useToast } from '@/context/ToastContext'
import { uploadService } from '@/services/contentService'
import type { UploadFolder } from '@/types/models'
import { cn } from '@/utils/format'
import { sized } from '@/utils/image'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'
const MAX_MB = 8

/**
 * Tracks images uploaded while a form is open. Anything uploaded but never saved is removed when the
 * form closes: the API refuses to delete an image still referenced, so calling it for every upload is safe.
 */
export function useUploadSession() {
  const uploaded = useRef<string[]>([])
  useEffect(
    () => () => {
      uploaded.current.forEach((url) => uploadService.discard(url).catch(() => undefined))
    },
    [],
  )
  return {
    register: (url: string) => uploaded.current.push(url),
    /** Called after a successful save: the saved images stay, any replaced in between are cleaned up. */
    settle: (keep: (string | null | undefined)[]) => {
      const keepSet = new Set(keep.filter(Boolean))
      uploaded.current.filter((u) => !keepSet.has(u)).forEach((url) => uploadService.discard(url).catch(() => undefined))
      uploaded.current = []
    },
    /** Called when a dialog is cancelled: its new uploads are removed. */
    discard: () => {
      uploaded.current.forEach((url) => uploadService.discard(url).catch(() => undefined))
      uploaded.current = []
    },
  }
}

interface ImageUploaderProps {
  label: string
  value: string | null | undefined
  onChange: (url: string | null) => void
  folder: UploadFolder
  onUploaded?: (url: string) => void
  aspect?: string
  hint?: string
  required?: boolean
  error?: string
}

/** Drop or choose an image; shows a preview, upload progress, replace and remove. */
export function ImageUploader({ label, value, onChange, folder, onUploaded, aspect = 'aspect-[4/3]', hint, required, error }: ImageUploaderProps) {
  const toast = useToast()
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File | undefined) => {
    if (!file) return
    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error('Unsupported file', 'Use a JPG, PNG, WebP or AVIF image.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error('Image too large', `The maximum size is ${MAX_MB} MB.`)
      return
    }
    setProgress(0)
    try {
      const result = await uploadService.upload(file, folder, setProgress)
      onUploaded?.(result.url)
      onChange(result.url)
      toast.success('Image uploaded')
    } catch (e) {
      toast.error('Upload failed', e instanceof Error ? e.message : undefined)
    } finally {
      setProgress(null)
      if (input.current) input.current.value = ''
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    upload(event.dataTransfer.files?.[0])
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-caption text-ink-muted">
        {label}
        {required && <span className="text-champagne-deep"> *</span>}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-xs border border-dashed transition-colors',
          aspect,
          dragging ? 'border-champagne-deep bg-champagne-light/20' : error ? 'border-error' : 'border-line-strong bg-ivory',
        )}
      >
        {value ? (
          <>
            <img src={sized(value, 900)} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button type="button" onClick={() => input.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xs bg-porcelain/95 px-3 text-small text-ink shadow-soft hover:bg-porcelain">
                <RefreshCw className="size-3.5" aria-hidden /> Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className="inline-flex size-9 items-center justify-center rounded-xs bg-porcelain/95 text-error shadow-soft hover:bg-porcelain" aria-label={`Remove ${label}`}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-ink-muted hover:text-ink">
            <ImagePlus className="size-7" strokeWidth={1.25} aria-hidden />
            <span className="text-small font-medium">Drop an image or choose a file</span>
            <span className="text-[0.75rem]">JPG, PNG, WebP or AVIF · up to {MAX_MB} MB</span>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ivory/90" role="status">
            <LoaderCircle className="size-6 animate-spin text-champagne-deep" aria-hidden />
            <span className="text-small tabular">Uploading {progress}%</span>
            <span className="h-px w-32 bg-line">
              <span className="block h-px bg-espresso transition-[width]" style={{ width: `${progress}%` }} />
            </span>
          </div>
        )}
      </div>
      <input id={inputId} ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
      {hint && !error && <p className="text-small text-ink-muted">{hint}</p>}
      {error && (
        <p className="text-small font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
