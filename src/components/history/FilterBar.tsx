'use client'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Category } from '@/types'

interface FilterBarProps {
  dateFrom: string
  dateTo: string
  categoryId: string
  search: string
  categories: Category[]
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export function FilterBar({ dateFrom, dateTo, categoryId, search, categories, onChange, onReset }: FilterBarProps) {
  const catOptions = [
    { value: '', label: 'Alla kategorier' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <Input
          label="Från datum"
          type="date"
          value={dateFrom}
          onChange={e => onChange('dateFrom', e.target.value)}
        />
        <Input
          label="Till datum"
          type="date"
          value={dateTo}
          onChange={e => onChange('dateTo', e.target.value)}
        />
        <Select
          label="Kategori"
          options={catOptions}
          value={categoryId}
          onChange={e => onChange('categoryId', e.target.value)}
        />
        <Input
          label="Sök arbetsuppgift"
          type="search"
          placeholder="Sök..."
          value={search}
          onChange={e => onChange('search', e.target.value)}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onReset}>
          Återställ filter
        </Button>
      </div>
    </div>
  )
}
