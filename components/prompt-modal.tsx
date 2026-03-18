'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Copy, Check, Star, Calendar, Cpu, Tag, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { PromptData } from './prompt-card'

interface PromptModalProps {
  prompt: PromptData | null
  onClose: () => void
  onFavoriteToggle?: (id: number, newValue: boolean) => void
  onDelete?: (id: number) => void
  categoryColor?: string
}

const categoryColors: Record<string, string> = {
  'age-edit': '#f59e0b',
  'beauty-editorial': '#ec4899',
  'edit': '#8b5cf6',
  'ethnicity-change': '#06b6d4',
  'eye-treatment': '#10b981',
  'identity-swap': '#f97316',
  'lips': '#ef4444',
  'other': '#6b7280',
  'product-photography': '#3b82f6',
  'product-swap': '#14b8a6',
  'structured-prompt': '#a855f7',
  'ugc': '#84cc16',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function PromptModal({ prompt, onClose, onFavoriteToggle, onDelete, categoryColor }: PromptModalProps) {
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(prompt?.isFavorite || false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (prompt) {
      setIsFavorite(prompt.isFavorite)
    }
  }, [prompt])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (prompt) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [prompt])

  const handleCopy = useCallback(async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [prompt])

  const handleDelete = useCallback(async () => {
    if (!prompt || deleteLoading) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete?.(prompt.id)
        onClose()
        toast.success('Prompt deleted')
      } else {
        toast.error('Failed to delete prompt')
      }
    } catch {
      toast.error('Failed to delete prompt')
    } finally {
      setDeleteLoading(false)
    }
  }, [prompt, deleteLoading, onDelete, onClose])

  const handleFavorite = useCallback(async () => {
    if (!prompt || favoriteLoading) return
    setFavoriteLoading(true)
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const data = await res.json()
        setIsFavorite(data.isFavorite)
        onFavoriteToggle?.(prompt.id, data.isFavorite)
      }
    } catch {
      toast.error('Failed to update favorite')
    } finally {
      setFavoriteLoading(false)
    }
  }, [prompt, favoriteLoading, onFavoriteToggle])

  if (!prompt) return null

  const color = categoryColor || categoryColors[prompt.category] || '#6366f1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm px-2.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: color + '22', color }}
            >
              {prompt.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {prompt.model}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isFavorite
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-500 hover:text-yellow-400 hover:bg-gray-800'
              )}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('w-4 h-4', isFavorite && 'fill-yellow-400')} />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                'p-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm',
                copied
                  ? 'text-green-400 bg-green-400/10'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )}
              title="Copy prompt"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prompt text */}
        <div className="flex-1 overflow-y-auto p-6">
          <p
            className="text-gray-100 text-base leading-relaxed whitespace-pre-wrap"
            dir="auto"
          >
            {prompt.prompt}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(prompt.date)}
            </span>
            <span className="text-gray-600">ID: #{prompt.id}</span>
          </div>

          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Tag className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
