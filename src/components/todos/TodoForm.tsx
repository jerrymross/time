'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TodoFormData, TodoPriority } from '@/types'

interface TodoFormProps {
  initial?: Partial<TodoFormData>
  onSubmit: (data: TodoFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
  submitLabel?: string
}

const priorityOptions = [
  { value: 'hög', label: 'Hög' },
  { value: 'medel', label: 'Medel' },
  { value: 'låg', label: 'Låg' },
]

const EMPTY: TodoFormData = { title: '', description: '', priority: 'medel', deadline: '' }

export function TodoForm({ initial, onSubmit, onCancel, saving, submitLabel = 'Spara' }: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>({ ...EMPTY, ...initial })

  const set = (key: keyof TodoFormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Titel"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="Vad ska göras?"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Beskrivning
        </label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Valfri beskrivning..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Prioritet"
          value={form.priority}
          onChange={e => set('priority', e.target.value as TodoPriority)}
          options={priorityOptions}
        />

        <Input
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={e => set('deadline', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={saving} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving} className="flex-1">
          Avbryt
        </Button>
      </div>
    </form>
  )
}
