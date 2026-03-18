'use client'

import { useState, useCallback } from 'react'
import { Heart, Copy, Check, Calendar, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface PromptData {
  id: number
  prompt: string
  date: string
  model: string
  category: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface PromptCardProps {
  prompt: PromptData
  categoryColor?: string
  onFavoriteToggle?: (id: number, newValue: boolean) => void
  onClick?: (prompt: PromptData) => void
  view?: 'grid' | 'list'
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
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function PromptCard({
  prompt,
  categoryColor,
  onFavoriteToggle,
  onClick,
  view = 'grid',
}: PromptCardProps) {
  const [isFavorite, setIsFavorite] = useState(prompt.isFavorite)
  const [copied, setCopied] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const color = categoryColor || categoryColors[prompt.category] || '#6366f1'

  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (favoriteLoading) return
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
    },
    [prompt.id, favoriteLoading, onFavoriteToggle]
  )

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(prompt.prompt)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Failed to copy')
      }
    },
    [prompt.prompt]
  )

  const handleCardClick = useCallback(() => {
    onClick?.(prompt)
  }, [onClick, prompt])

  if (view === 'list') {
    return (
      <div
        className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-600 transition-colors group flex items-start gap-4"
        onClick={handleCardClick}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-gray-100 text-sm leading-relaxed line-clamp-2"
            dir="auto"
          >
            {prompt.prompt}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: color + '22', color }}
            >
              {prompt.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-mono">
              {prompt.model}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(prompt.date)}
            </span>
            {prompt.tags.length > 0 &&
              prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className={cn(
              'p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100',
              copied
                ? 'text-green-400'
                : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
            )}
            title="Copy prompt"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isFavorite
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100'
            )}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('w-4 h-4', isFavorite && 'fill-red-500')} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-600 transition-all duration-200 group flex flex-col gap-3 hover:shadow-lg hover:shadow-black/20"
      onClick={handleCardClick}
    >
      {/* Top row: category badge + actions */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ backgroundColor: color + '22', color }}
        >
          {prompt.category}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={cn(
              'p-1 rounded transition-colors opacity-0 group-hover:opacity-100',
              copied
                ? 'text-green-400'
                : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
            )}
            title="Copy prompt"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className={cn(
              'p-1 rounded transition-colors',
              isFavorite
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100'
            )}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('w-3.5 h-3.5', isFavorite && 'fill-red-500')} />
          </button>
        </div>
      </div>

      {/* Prompt text */}
      <p
        className="text-gray-200 text-sm leading-relaxed line-clamp-3 flex-1"
        dir="auto"
      >
        {prompt.prompt}
      </p>

      {/* Bottom row: model + date */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Cpu className="w-3 h-3" />
          <span className="font-mono truncate max-w-[120px]">{prompt.model}</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {formatDate(prompt.date)}
        </span>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
