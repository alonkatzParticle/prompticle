'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, LayoutGrid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { PromptCard, type PromptData } from '@/components/prompt-card'
import { PromptModal } from '@/components/prompt-modal'
import { SearchBar } from '@/components/search-bar'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  color: string
  promptCount: number
}

interface PromptsResponse {
  prompts: PromptData[]
  total: number
  page: number
  totalPages: number
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 bg-gray-800 rounded-full" />
        <div className="h-5 w-16 bg-gray-800 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-800 rounded" />
        <div className="h-4 w-3/4 bg-gray-800 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div className="h-3 w-20 bg-gray-800 rounded" />
        <div className="h-3 w-20 bg-gray-800 rounded" />
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('favoritesOnly', 'true')
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('sortBy', sortBy)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/prompts?${params.toString()}`)
      const data: PromptsResponse = await res.json()
      setPrompts(data.prompts || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sortBy, page])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, sortBy])

  const categoryColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]))

  const handleFavoriteToggle = useCallback((id: number, newValue: boolean) => {
    if (!newValue) {
      // Remove from favorites view
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null)
      }
    } else {
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite: newValue } : p))
      )
    }
  }, [selectedPrompt])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-gray-950 border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h1 className="text-lg font-bold text-gray-100">Favorites</h1>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search favorites..."
            className="flex-1"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="created_desc">Recently Added</option>
          </select>

          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 transition-colors',
                view === 'grid'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 transition-colors',
                view === 'list'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {loading ? 'Loading...' : `${total.toLocaleString()} favorited prompt${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-gray-300 font-medium mb-1">No favorites yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {search
                ? 'No favorites match your search.'
                : 'Heart prompts in the library to save them here.'}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                categoryColor={categoryColorMap[prompt.category]}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={setSelectedPrompt}
                view={view}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onFavoriteToggle={handleFavoriteToggle}
          categoryColor={categoryColorMap[selectedPrompt.category]}
        />
      )}
    </div>
  )
}
