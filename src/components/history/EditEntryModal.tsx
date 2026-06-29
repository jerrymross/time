'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Category, TimeEntry, TimeEntryFormData } from '@/types'
import { calcDurationMinutes, formatDuration } from '@/lib/utils'

interface EditEntryModalProps {
  open: boolean
  onClose: () => void
  onSave: (id: string, data: Partial<TimeEntryFormData>) => Promise<void>
  entry: TimeEntry | null
  categories: Category[]
  saving: boolean
}

export function EditEntryModal({ open, onClose, onSave, entry, categories, saving }: EditEntryModalProps) {
  const [form, setForm] = useState<TimeEntryFormData>({
    category_id: '',
    task_description: '',
    entry_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TimeEntryFormData, string>>>({})

  useEffect(() => {
    if (!entry || !open) return
    setForm({
      category_id: entry.category_id ?? '',
      task_description: entry.task_description ?? '',
      entry_date: entry.entry_date,
      start_time: entry.start_time.slice(0, 5),
      end_time: entry.end_time.slice(0, 5),
      duration_minutes: entry.duration_minutes,
    })
    setErrors({})
  }, [entry, open])

  useEffect(() => {
    if (!form.start_time || !form.end_time) return
    const mins = calcDurationMinutes(form.start_time, form.end_time)
    setForm(prev => ({ ...prev, duration_minutes: Math.max(0, mins) }))
  }, [form.start_time, form.end_time])

  const set = (key: keyof TimeEntryFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!form.category_id) errs.category_id = 'Välj en kategori'
    if (!form.task_description.trim()) errs.task_description = 'Beskriv arbetsuppgiften'
    if (!form.entry_date) errs.entry_date = 'Ange datum'
    if (!form.start_time) errs.start_time = 'Ange starttid'
    if (!form.end_time) errs.end_time = 'Ange sluttid'
    if (form.duration_minutes <= 0) errs.end_time = 'Sluttiden måste vara senare än starttiden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!entry || !validate()) return
    await onSave(entry.id, form)
    onClose()
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <Modal open={open} onClose={onClose} title="Redigera registrering" size="md">
      <div className="space-y-4">
        <Select
          label="Kategori"
          options={catOptions}
          value={form.category_id}
          onChange={e => set('category_id', e.target.value)}
          error={errors.category_id}
          placeholder="Välj kategori..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arbetsuppgift
          </label>
          <textarea
            rows={3}
            value={form.task_description}
            onChange={e => set('task_description', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
          {errors.task_description && <p className="text-xs text-red-500 mt-1">{errors.task_description}</p>}
        </div>

        <Input
          label="Datum"
          type="date"
          value={form.entry_date}
          onChange={e => set('entry_date', e.target.value)}
          error={errors.entry_date}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Starttid" type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} error={errors.start_time} />
          <Input label="Sluttid" type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} error={errors.end_time} />
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Beräknad tid:</span>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {form.duration_minutes > 0 ? formatDuration(form.duration_minutes) : '—'}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>Avbryt</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving}>Spara</Button>
        </div>
      </div>
    </Modal>
  )
}
