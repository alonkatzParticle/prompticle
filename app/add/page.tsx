'use client'

import { useState, useRef } from 'react'
import { PlusCircle, Upload, FileJson, X, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'age-edit',
  'beauty-editorial',
  'edit',
  'ethnicity-change',
  'eye-treatment',
  'identity-swap',
  'lips',
  'other',
  'product-photography',
  'product-swap',
  'structured-prompt',
  'ugc',
]

const MODELS = ['nano_banana_2', 'nano_banana_2_upscale', 'nano_banana_flash']

export default function AddPromptPage() {
  const [promptText, setPromptText] = useState('')
  const [category, setCategory] = useState('other')
  const [model, setModel] = useState('nano_banana_2')
  const [customModel, setCustomModel] = useState('')
  const [tags, setTags] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)

  // Bulk import
  const [bulkJson, setBulkJson] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptText.trim()) {
      toast.error('Prompt text is required')
      return
    }
    setSubmitting(true)
    try {
      const finalModel = model === '__custom__' ? customModel : model
      if (!finalModel.trim()) {
        toast.error('Model is required')
        setSubmitting(false)
        return
      }
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText.trim(),
          category,
          model: finalModel.trim(),
          date,
          tags: tagList,
        }),
      })

      if (res.ok) {
        toast.success('Prompt added successfully!')
        setPromptText('')
        setTags('')
        setCategory('other')
        setModel('nano_banana_2')
        setCustomModel('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add prompt')
      }
    } catch {
      toast.error('Failed to add prompt')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setBulkJson(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleBulkImport = async () => {
    if (!bulkJson.trim()) {
      toast.error('Please paste or upload JSON data')
      return
    }
    setBulkLoading(true)
    setBulkResult(null)
    try {
      const parsed = JSON.parse(bulkJson)
      const array = Array.isArray(parsed) ? parsed : [parsed]

      const res = await fetch('/api/prompts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(array),
      })

      const data = await res.json()
      if (res.ok) {
        setBulkResult(data)
        toast.success(`Imported ${data.created} prompts!`)
        setBulkJson('')
      } else {
        toast.error(data.error || 'Bulk import failed')
      }
    } catch (err) {
      toast.error('Invalid JSON format')
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-indigo-400" />
          Add Prompt
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Add a single prompt or bulk import from JSON.
        </p>
      </div>

      {/* Single prompt form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-4">Single Prompt</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Prompt <span className="text-red-400">*</span>
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={6}
              dir="auto"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y min-h-[160px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Model <span className="text-red-400">*</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
              {model === '__custom__' && (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Enter model name"
                  className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tags{' '}
                <span className="text-gray-500 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="portrait, lighting, cinematic"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'Adding...' : 'Add Prompt'}
          </button>
        </form>
      </div>

      {/* Bulk import */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-200 mb-1 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-indigo-400" />
          Bulk Import (JSON)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Upload a JSON file or paste an array of prompt objects. Each object needs:{' '}
          <code className="text-gray-400">prompt</code>,{' '}
          <code className="text-gray-400">model</code>,{' '}
          <code className="text-gray-400">category</code>. Optional:{' '}
          <code className="text-gray-400">date</code>,{' '}
          <code className="text-gray-400">tags</code>.
        </p>

        {/* File upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors mb-4"
        >
          <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Click to upload JSON file, or drag & drop
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-900 px-2 text-xs text-gray-500">or paste JSON</span>
          </div>
        </div>

        {/* JSON textarea */}
        <div className="relative">
          <textarea
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            placeholder='[{"prompt": "...", "model": "nano_banana_2", "category": "other"}]'
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-y"
          />
          {bulkJson && (
            <button
              onClick={() => setBulkJson('')}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleBulkImport}
          disabled={bulkLoading || !bulkJson.trim()}
          className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          {bulkLoading ? 'Importing...' : 'Import Prompts'}
        </button>

        {/* Import result */}
        {bulkResult && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4" />
              Successfully imported {bulkResult.created} prompts
            </div>
            {bulkResult.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-red-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  {bulkResult.errors.length} error(s):
                </div>
                <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                  {bulkResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
