'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LayoutGrid, List, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { FilterSidebar } from '@/components/filter-sidebar'
import { PromptCard, type PromptData } from '@/components/prompt-card'
import { PromptModal } from '@/components/prompt-modal'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  color: string
  icon: string
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

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  // initialized gates the first fetch until URL params have been applied
  const [initialized, setInitialized] = useState(false)

  // Read ?category= from URL on mount, then mark as initialized
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat) {
      setSelectedCategories([cat])
      setFilterOpen(true)
    }
    setInitialized(true)
  }, [])

  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  // Fetch prompts
  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
      if (selectedModels.length > 0) params.set('model', selectedModels.join(','))
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
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
  }, [debouncedSearch, selectedCategories, selectedModels, dateFrom, dateTo, sortBy, page])

  useEffect(() => {
    if (!initialized) return
    fetchPrompts()
  }, [fetchPrompts, initialized])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedCategories, selectedModels, dateFrom, dateTo, sortBy])

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedModels([])
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedModels.length > 0 ||
    !!dateFrom ||
    !!dateTo

  const categoryColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]))

  const handleFavoriteToggle = useCallback((id: number, newValue: boolean) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: newValue } : p))
    )
    if (selectedPrompt?.id === id) {
      setSelectedPrompt((prev) => prev ? { ...prev, isFavorite: newValue } : prev)
    }
  }, [selectedPrompt])

  const handleDelete = useCallback((id: number) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
    setTotal((prev) => prev - 1)
    setSelectedPrompt(null)
  }, [])

  return (
    <div className="flex h-full">
      {/* Filter sidebar - desktop */}
      <aside
        className={cn(
          'hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-all duration-200',
          !filterOpen && 'lg:hidden'
        )}
      >
        <div className="p-4">
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            selectedModels={selectedModels}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onCategoryChange={setSelectedCategories}
            onModelChange={setSelectedModels}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </aside>

      {/* Mobile filter overlay */}
      {filterOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-800 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="font-semibold text-gray-100">Filters</span>
              <button
                onClick={() => setFilterOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                selectedModels={selectedModels}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onCategoryChange={setSelectedCategories}
                onModelChange={setSelectedModels}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 bg-gray-950 border-b border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors border',
                filterOpen || hasActiveFilters
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 w-4 h-4 flex items-center justify-center bg-indigo-500 text-white rounded-full text-xs">
                  {selectedCategories.length + selectedModels.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Search */}
            <SearchBar
              value={search}
              onChange={setSearch}
              className="flex-1"
            />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden sm:block bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="created_desc">Recently Added</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-2 transition-colors',
                  view === 'grid'
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-500 hover:text-gray-300'
                )}
                title="Grid view"
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
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${total.toLocaleString()} prompt${total !== 1 ? 's' : ''}`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Prompts grid/list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div
              className={cn(
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'flex flex-col gap-3'
              )}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-gray-300 font-medium mb-1">No prompts found</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {hasActiveFilters || search
                  ? 'Try adjusting your filters or search terms.'
                  : 'Add your first prompt to get started.'}
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

          {/* Pagination */}
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

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (page <= 4) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = page - 3 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                        pageNum === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

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
      </div>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onFavoriteToggle={handleFavoriteToggle}
          onDelete={handleDelete}
          categoryColor={categoryColorMap[selectedPrompt.category]}
        />
      )}
    </div>
  )
}
