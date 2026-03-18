'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODELS = ['nano_banana_2', 'nano_banana_2_upscale', 'nano_banana_flash']

interface FilterSidebarProps {
  categories: Array<{ id: number; name: string; color: string; promptCount: number }>
  selectedCategories: string[]
  selectedModels: string[]
  dateFrom: string
  dateTo: string
  onCategoryChange: (categories: string[]) => void
  onModelChange: (models: string[]) => void
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-800 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-gray-100 mb-2"
      >
        {title}
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

export function FilterSidebar({
  categories,
  selectedCategories,
  selectedModels,
  dateFrom,
  dateTo,
  onCategoryChange,
  onModelChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  hasActiveFilters,
}: FilterSidebarProps) {
  const toggleCategory = (name: string) => {
    if (selectedCategories.includes(name)) {
      onCategoryChange(selectedCategories.filter((c) => c !== name))
    } else {
      onCategoryChange([...selectedCategories, name])
    }
  }

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      onModelChange(selectedModels.filter((m) => m !== model))
    } else {
      onModelChange([...selectedModels, model])
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <CollapsibleSection title="Categories">
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer group py-0.5"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-indigo-500 cursor-pointer focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span
                className={cn(
                  'text-xs flex-1 truncate',
                  selectedCategories.includes(cat.name)
                    ? 'text-gray-100'
                    : 'text-gray-400 group-hover:text-gray-300'
                )}
              >
                {cat.name}
              </span>
              <span className="text-xs text-gray-600 ml-auto">{cat.promptCount}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Models */}
      <CollapsibleSection title="Models">
        <div className="space-y-1">
          {MODELS.map((model) => (
            <label
              key={model}
              className="flex items-center gap-2 cursor-pointer group py-0.5"
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => toggleModel(model)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-indigo-500 cursor-pointer focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span
                className={cn(
                  'text-xs font-mono truncate',
                  selectedModels.includes(model)
                    ? 'text-gray-100'
                    : 'text-gray-400 group-hover:text-gray-300'
                )}
              >
                {model}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Date Range */}
      <CollapsibleSection title="Date Range">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
