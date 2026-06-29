'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Category, ManualEntryFormData } from '@/types'
import { toLocalDateString, calcDurationMinutes, formatDuration } from '@/lib/utils'

interface ManualEntryFormProps {
  categories: Category[]
  onSave: (data: ManualEntryFormData) => Promise<void>
  saving: boolean
}

const emptyForm = (): ManualEntryFormData => ({
  category_id: '',
  task_description: '',
  entry_date: toLocalDateString(new Date()),
  start_time: '08:00',
  end_time: '09:00',
  duration_minutes: 60,
})

export function ManualEntryForm({ categories, onSave, saving }: ManualEntryFormProps) {
  const [form, setForm] = useState<ManualEntryFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ManualEntryFormData, string>>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (categories.length > 0 && !form.category_id) {
      setForm(prev => ({ ...prev, category_id: categories[0].id }))
    }
  }, [categories])

  useEffect(() => {
    const mins = calcDurationMinutes(form.start_time, form.end_time)
    setForm(prev => ({ ...prev, duration_minutes: Math.max(0, mins) }))
  }, [form.start_time, form.end_time])

  const set = (key: keyof ManualEntryFormData, value: string | number) =>
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
    if (!validate()) return
    await onSave(form)
    setForm(emptyForm())
    setErrors({})
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Lägg till manuellt</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            options={catOptions}
            value={form.category_id}
            onChange={e => set('category_id', e.target.value)}
            error={errors.category_id}
            placeholder="Välj kategori..."
          />
          <Input
            label="Datum"
            type="date"
            value={form.entry_date}
            onChange={e => set('entry_date', e.target.value)}
            error={errors.entry_date}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arbetsuppgift
          </label>
          <textarea
            rows={2}
            value={form.task_description}
            onChange={e => set('task_description', e.target.value)}
            placeholder="Beskriv vad du jobbade med..."
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
          {errors.task_description && (
            <p className="text-xs text-red-500 mt-1">{errors.task_description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Starttid"
            type="time"
            value={form.start_time}
            onChange={e => set('start_time', e.target.value)}
            error={errors.start_time}
          />
          <Input
            label="Sluttid"
            type="time"
            value={form.end_time}
            onChange={e => set('end_time', e.target.value)}
            error={errors.end_time}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-slate-700/50 px-4 py-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Beräknad tid:</span>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {form.duration_minutes > 0 ? formatDuration(form.duration_minutes) : '—'}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          loading={saving}
        >
          Spara registrering
        </Button>

        {success && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            Registreringen sparades!
          </div>
        )}
      </div>
    </Card>
  )
}
