'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Category, ActiveTimer, StopTimerFormData } from '@/types'
import { toLocalDateString, toLocalTimeString, calcDurationMinutes, formatDuration } from '@/lib/utils'

interface StopTimerModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: StopTimerFormData) => Promise<void>
  activeTimer: ActiveTimer | null
  categories: Category[]
  saving: boolean
}

export function StopTimerModal({ open, onClose, onSave, activeTimer, categories, saving }: StopTimerModalProps) {
  const [form, setForm] = useState<StopTimerFormData>({
    category_id: '',
    task_description: '',
    entry_date: toLocalDateString(new Date()),
    start_time: '08:00',
    end_time: toLocalTimeString(new Date()),
    duration_minutes: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof StopTimerFormData, string>>>({})

  useEffect(() => {
    if (!open || !activeTimer) return
    const started = new Date(activeTimer.started_at)
    const now = new Date()
    const startTime = toLocalTimeString(started)
    const endTime = toLocalTimeString(now)
    const date = toLocalDateString(started)

    setForm({
      category_id: categories[0]?.id ?? '',
      task_description: '',
      entry_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: calcDurationMinutes(startTime, endTime),
    })
    setErrors({})
  }, [open, activeTimer, categories])

  // Räkna om duration när start/slut ändras
  useEffect(() => {
    const mins = calcDurationMinutes(form.start_time, form.end_time)
    setForm(prev => ({ ...prev, duration_minutes: mins }))
  }, [form.start_time, form.end_time])

  const set = (key: keyof StopTimerFormData, value: string | number) =>
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
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <Modal open={open} onClose={onClose} title="Registrera arbetstid" size="md">
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
            placeholder="Beskriv vad du jobbade med..."
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
          {errors.task_description && (
            <p className="text-xs text-red-500 mt-1">{errors.task_description}</p>
          )}
        </div>

        <Input
          label="Datum"
          type="date"
          value={form.entry_date}
          onChange={e => set('entry_date', e.target.value)}
          error={errors.entry_date}
        />

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

        {/* Beräknad tid */}
        <div className="rounded-xl bg-forest-50 dark:bg-forest-900/20 p-4 text-center">
          <p className="text-xs text-forest-700 dark:text-forest-400 mb-1">Beräknad arbetstid</p>
          <p className="text-2xl font-bold text-forest-800 dark:text-forest-300">
            {form.duration_minutes > 0 ? formatDuration(form.duration_minutes) : '—'}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Avbryt
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving}>
            Spara
          </Button>
        </div>
      </div>
    </Modal>
  )
}
