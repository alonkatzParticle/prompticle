'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  color: string
  icon: string
  promptCount: number
}

const DEFAULT_COLORS = [
  '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981',
  '#f97316', '#ef4444', '#6b7280', '#3b82f6', '#14b8a6',
  '#a855f7', '#84cc16', '#6366f1', '#e11d48', '#0891b2',
]

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
}) {
  const router = useRouter()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: category.color + '22' }}
        >
          <Tag className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-gray-200 text-sm mb-1">{category.name}</h3>
      <p className="text-xs text-gray-500">{category.promptCount} prompt{category.promptCount !== 1 ? 's' : ''}</p>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-xs font-mono text-gray-500">{category.color}</span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/?category=${encodeURIComponent(category.name)}`)}
        className="mt-3 w-full text-xs text-center py-1.5 rounded border border-gray-800 text-gray-500 hover:text-gray-200 hover:border-gray-600 transition-colors"
      >
        Browse prompts →
      </button>
    </div>
  )
}

function EditModal({
  category,
  onSave,
  onClose,
}: {
  category: Category | null
  onSave: (data: Partial<Category>) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [color, setColor] = useState(category?.color || '#6366f1')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    await onSave({ name: name.trim(), color })
    setSaving(false)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base font-semibold text-gray-100 mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform hover:scale-110',
                    color === c && 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110'
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null | 'new'>('new' as any)
  const [showModal, setShowModal] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleSave = async (data: Partial<Category>) => {
    try {
      if (editingCategory && typeof editingCategory !== 'string' && editingCategory !== null) {
        // Edit existing
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast.success('Category updated!')
          setShowModal(false)
          fetchCategories()
        } else {
          toast.error('Failed to update category')
        }
      } else {
        // Create new
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          toast.success('Category created!')
          setShowModal(false)
          fetchCategories()
        } else {
          const err = await res.json()
          toast.error(err.error || 'Failed to create category')
        }
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? This won't delete the prompts in it.`)) return
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        toast.error('Failed to delete category')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Tag className="w-6 h-6 text-indigo-400" />
              Categories
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your prompt categories and their colors.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-800 mb-3" />
                <div className="h-4 w-24 bg-gray-800 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EditModal
          category={editingCategory as Category | null}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
